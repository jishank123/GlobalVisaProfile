import {useState, useEffect, useCallback} from 'react';
import {useAuth} from '../../../contexts/AuthContext';
import Sidebar from './components/Sidebar';
import TopNavbar from './components/TopNavbar';
import {
    CrmStats,
    ClientsManagement,
    ProjectsManagement,
    TasksManagement,
    QueriesManagement,
    AppointmentsManagement,
    PaymentsManagement
} from './components';

const CRMManagerDashboard = () => {
    const {user, logout} = useAuth();
    const [activeSection, setActiveSection] = useState('dashboard');
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);

    // Data states
    const [dashboardData, setDashboardData] = useState({
        clients: [],
        projects: [],
        tasks: [],
        queries: [],
        appointments: [],
        payments: [],
        recentActivity: []
    });

    const [stats, setStats] = useState({
        totalClients: 0,
        activeProjects: 0,
        pendingQueries: 0,
        avgProgress: 0,
        clientsCount: 0,
        projectsCount: 0,
        tasksCount: 0,
        queriesCount: 0,
        appointmentsCount: 0,
        clientsChange: 'Loading...',
        projectsChange: 'Loading...',
        queriesChange: 'Loading...',
        progressChange: 'Loading...'
    });

    // API configuration
    const API_BASE = 'http://localhost:5000/api';
    const authToken = localStorage.getItem('token') || localStorage.getItem('client_token');

    useEffect(() => {
        refreshAllData();

        // Auto-refresh every 5 minutes
        const interval = setInterval(refreshAllData, 300000);
        return() => clearInterval(interval);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => { // Initialize dashboard
        setLoading(false);
    }, []);

    const apiCall = async (endpoint, options = {}) => {
        const url = `${API_BASE}${endpoint}`;
        const config = {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            ...options
        };

        try {
            const response = await fetch(url, config);
            const data = await response.json();

            if (! response.ok) {
                if (response.status === 401) {
                    localStorage.clear();
                    logout();
                    return;
                }
                throw new Error(data.error ?. message || data.message || `HTTP ${
                    response.status
                }`);
            }

            return data;
        } catch (error) {
            console.error('API Error:', error);
            return {success: false, error: error.message, message: error.message};
        }
    };

    const refreshAllData = useCallback(async () => {
        setIsRefreshing(true);
        try {
            await Promise.all([
                loadMyClients(),
                loadMyProjects(),
                loadClientQueries(),
                loadAppointments(),
                loadPayments(),
                loadRecentActivity()
            ]);

            // Load tasks after projects are loaded
            await loadMyTasks();
        } catch (error) {
            console.error('Error refreshing data:', error);
        } finally {
            setIsRefreshing(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const loadMyClients = async () => {
        try {
            const [clientsResponse, leadsResponse] = await Promise.all([apiCall('/clients/my-clients').catch(() => ({success: false, data: []})), apiCall('/leads/my-leads').catch(() => ({success: false, data: []}))]);

            const clients = clientsResponse.success ? clientsResponse.data : [];
            const leads = leadsResponse.success ? leadsResponse.data : [];

            const leadsAsClients = leads.map(lead => ({
                _id: lead._id,
                name: `${
                    lead.firstName
                } ${
                    lead.lastName
                }`,
                email: lead.email,
                phone: lead.phone,
                university: lead.university,
                status: 'lead_assigned',
                isLead: true,
                originalLead: lead
            }));

            const allClients = [
                ... clients,
                ... leadsAsClients
            ];

            setDashboardData(prev => ({
                ...prev,
                clients: allClients
            }));
            setStats(prev => ({
                ...prev,
                totalClients: allClients.length,
                clientsCount: allClients.length,
                clientsChange: leads.length > 0 ? `${
                    leads.length
                } new leads` : 'All converted'
            }));
        } catch (error) {
            console.error('Error loading clients:', error);
        }
    };

    const loadMyProjects = async () => {
        try {
            const response = await apiCall('/projects/my-projects');
            if (response.success) {
                const projects = response.data || [];
                const activeProjects = projects.filter(p => ['active', 'in_progress'].includes(p.status)).length;
                const avgProgress = projects.length > 0 ? Math.round(projects.reduce((sum, p) => sum + (p.progress || 0), 0) / projects.length) : 0;

                setDashboardData(prev => ({
                    ...prev,
                    projects
                }));
                setStats(prev => ({
                    ...prev,
                    activeProjects,
                    avgProgress,
                    projectsCount: activeProjects,
                    projectsChange: `${
                        projects.length
                    } total projects`,
                    progressChange: `${avgProgress}% average`
                }));
            }
        } catch (error) {
            console.error('Error loading projects:', error);
        }
    };

    const loadMyTasks = async () => {
        try { // Extract tasks from projects
            const allTasks = [];
            dashboardData.projects.forEach(project => {
                if (project.milestones && project.milestones.length > 0) {
                    project.milestones.forEach(milestone => {
                        const client = dashboardData.clients.find(c => c._id === project.client) || {
                            name: 'Unknown Client',
                            _id: project.client
                        };

                        allTasks.push({
                            ...milestone,
                            project: project,
                            client: client
                        });
                    });
                }
            });

            const pendingTasks = allTasks.filter(t => ['pending', 'in_progress'].includes(t.status)).length;

            setDashboardData(prev => ({
                ...prev,
                tasks: allTasks
            }));
            setStats(prev => ({
                ...prev,
                tasksCount: pendingTasks
            }));
        } catch (error) {
            console.error('Error loading tasks:', error);
        }
    };

    const loadClientQueries = async () => {
        try {
            const response = await apiCall('/queries/my-queries');
            if (response.success) {
                const queries = response.data || [];
                const pendingQueries = queries.filter(q => ['new', 'pending'].includes(q.status)).length;

                setDashboardData(prev => ({
                    ...prev,
                    queries
                }));
                setStats(prev => ({
                    ...prev,
                    pendingQueries,
                    queriesCount: pendingQueries,
                    queriesChange: `${
                        queries.length
                    } total queries`
                }));
            }
        } catch (error) {
            console.error('Error loading queries:', error);
        }
    };

    const loadAppointments = async () => {
        try {
            const clientEmails = dashboardData.clients.map(client => client.email).filter(email => email);

            if (clientEmails.length === 0) 
                return;
            

            const appointmentPromises = clientEmails.map(async (email) => {
                try {
                    const response = await apiCall(`/appointments/client/${
                        encodeURIComponent(email)
                    }`);

                    if (response.success && response.data) {
                        return Array.isArray(response.data) ? response.data.map(apt => ({
                            ...apt,
                            clientEmail: email
                        })) : response.data.appointments ? response.data.appointments.map(apt => ({
                            ...apt,
                            clientEmail: email
                        })) : [];
                    }
                    return [];
                } catch (error) {
                    return [];
                }
            });

            const allAppointments = await Promise.all(appointmentPromises);
            const appointments = allAppointments.flat();
            const upcomingAppointments = appointments.filter(a => new Date(a.datetime) > new Date() && a.status !== 'cancelled').length;

            setDashboardData(prev => ({
                ...prev,
                appointments
            }));
            setStats(prev => ({
                ...prev,
                appointmentsCount: upcomingAppointments
            }));
        } catch (error) {
            console.error('Error loading appointments:', error);
        }
    };

    const loadPayments = async () => {
        try { // Try to get payment stats first
            const statsResponse = await apiCall('/payments/stats/summary');

            let foundPayments = [];

            if (statsResponse.success && statsResponse.data) { // Try to load known payments
                const knownPaymentIds = ['697af51126bb0273601bae20'];

                for (const paymentId of knownPaymentIds) {
                    try {
                        const paymentResponse = await apiCall(`/payments/${paymentId}`);
                        if (paymentResponse.success && paymentResponse.data) {
                            const payment = paymentResponse.data;
                            const isAssignedClient = dashboardData.clients.some(c => c._id === payment.client._id);

                            if (isAssignedClient) {
                                foundPayments.push(payment);
                            }
                        }
                    } catch (error) {
                        console.log(`Could not fetch payment ${paymentId}`);
                    }
                }
            }

            setDashboardData(prev => ({
                ...prev,
                payments: foundPayments
            }));
        } catch (error) {
            console.error('Error loading payments:', error);
        }
    };

    const loadRecentActivity = async () => {
        try {
            const response = await apiCall('/activity/recent');
            if (response.success) {
                setDashboardData(prev => ({
                    ...prev,
                    recentActivity: response.data || []
                }));
            }
        } catch (error) {
            console.error('Error loading recent activity:', error);
        }
    };

    const handleSectionChange = (section) => {
        setActiveSection(section);
        setSidebarOpen(false);
    };

    if (loading) {
        return (<div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading CRM dashboard...</p>
            </div>
        </div>);
    }

    const renderActiveSection = () => {
        switch (activeSection) {
            case 'dashboard':
                return <CrmStats stats={stats}
                    recentActivity={
                        dashboardData.recentActivity
                    }/>;
            case 'clients':
                return <ClientsManagement apiCall={apiCall}
                    onViewClient={
                        () => {}
                    }
                    onMessageClient={
                        () => {}
                    }/>;
            case 'projects':
                return <ProjectsManagement apiCall={apiCall}
                    onViewProject={
                        () => {}
                    }
                    onUpdateProject={
                        () => {}
                    }/>;
            case 'tasks':
                return <TasksManagement apiCall={apiCall}
                    projects={
                        dashboardData.projects
                    }
                    clients={
                        dashboardData.clients
                    }/>;
            case 'queries':
                return <QueriesManagement apiCall={apiCall}
                    clients={
                        dashboardData.clients
                    }/>;
            case 'appointments':
                return <AppointmentsManagement apiCall={apiCall}
                    clients={
                        dashboardData.clients
                    }/>;
            case 'payments':
                return <PaymentsManagement apiCall={apiCall}
                    clients={
                        dashboardData.clients
                    }/>;
            default:
                return <CrmStats stats={stats}
                    recentActivity={
                        dashboardData.recentActivity
                    }/>;
        }
    };

    // Responsive styles
    const getMainContentStyle = () => {
        const baseStyle = {
            marginTop: '70px',
            padding: '30px',
            minHeight: 'calc(100vh - 70px)',
            overflow: 'auto',
            transition: 'margin-left 0.3s ease'
        };

        // Desktop: sidebar always visible
        if (window.innerWidth >= 768) {
            return {
                ... baseStyle,
                marginLeft: '250px',
                width: 'calc(100% - 250px)'
            };
        }

        // Mobile: sidebar toggleable
        return {
            ... baseStyle,
            marginLeft: sidebarOpen ? '250px' : '0',
            width: sidebarOpen ? 'calc(100% - 250px)' : '100%'
        };
    };

    return (<div className="min-h-screen"
        style={
            {
                background: '#f8f9fa',
                fontFamily: 'Inter, sans-serif'
            }
    }>
        <TopNavbar user={user}
            logout={logout}
            sidebarOpen={sidebarOpen}
            setSidebarOpen={setSidebarOpen}/>
        <Sidebar activeSection={activeSection}
            setActiveSection={setActiveSection}
            sidebarOpen={sidebarOpen}
            setSidebarOpen={setSidebarOpen}
            stats={stats}/>

        <div style={
            getMainContentStyle()
        }> {
            renderActiveSection()
        } </div>

        {/* Mobile overlay */}
        {
        sidebarOpen && window.innerWidth < 768 && (<div style={
                {
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0,0,0,0.5)',
                    zIndex: 998
                }
            }
            onClick={
                () => setSidebarOpen(false)
            }/>)
    } </div>);
};

export default CRMManagerDashboard;
