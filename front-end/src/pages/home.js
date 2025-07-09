import React, { useState, useEffect } from 'react';
import './home.css';
import { TeamOutlined, HistoryOutlined, UserOutlined, PlusOutlined } from '@ant-design/icons';
import { Layout, Menu, theme } from 'antd';
import AddStudent from '../components/add-student';
import AddClass from '../components/add-class';
import { auth } from './firebase';
import { signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import Record from './record';
import axios from 'axios';
import StudentAttendanceData from '../components/student-attendance-data';

const { Header, Content, Footer, Sider } = Layout;

// Horizontal menu items
const items1 = [
  {
    key: 'classes',
    label: 'Classes',
  },
  {
    key: 'new-class',
    label: 'New Class',
    icon: <PlusOutlined />
  },
  {
    key: 'new-student',
    label: 'New Student',
    icon: <PlusOutlined />
  },
  {
    key: 'record',
    label: 'Record',
  },
  {
    key: 'logout',
    label: 'Logout',
    danger: true, // Optional: for a red logout button
  },
];



function HomePage() {
  const navigate = useNavigate();

  const {
    token: { borderRadiusLG },
  } = theme.useToken();

  const [selectedKey, setSelectedKey] = useState('');
  const [selectedTopKey, setSelectedTopKey] = useState('classes');
  const [items2, setItems2] = useState([])

  const fetchSidebarData = () => {
    const teacherId = localStorage.getItem('id');
    axios.get(`http://localhost:8000/get-side-bar?teacher_id=${teacherId}`)
      .then(response => {
        for(const class_data of response.data){
          class_data["icon"] = React.createElement(TeamOutlined)
        }
        setItems2(response.data)
        console.log(response.data)
      })
      .catch(error => {
        console.error('Error fetching side bar data:', error);
      });
  };

  useEffect(() => {
    fetchSidebarData();
  }, []);

  async function handleTopMenuClick(key){
    setSelectedTopKey(key);
    if (key === "logout"){
      try {
        const userEmail = auth.currentUser ? auth.currentUser.email : 'anonymous'; // Get user email before signOut
        await signOut(auth);
        navigate(`/login-page?email=${encodeURIComponent(userEmail)}`); // Redirect with email as query parameter
      } catch (error) {
        console.error("Error logging out:", error);
        // Optionally, show an error message to the user
      }
    }
  };

  const renderContent = () => {
    if (selectedTopKey === "new-class") {
      return <AddClass onClassAdded={fetchSidebarData} />;
    } else if (selectedTopKey === "new-student") {
      return <AddStudent onClassAdded={fetchSidebarData}/>;
    } else if (selectedTopKey == "record"){
      return <Record/>
    } else if (selectedTopKey == "classes"){
      return <StudentAttendanceData data = {selectedKey}/>
    }
    // Default return if no matching key, or add other content rendering conditions
    return null;
  };

  return (
    <Layout style={{ minHeight: '100vh', background: '#0f172a' }}>
      <Header style={{ display: 'flex', alignItems: 'center', background: '#0f172a' }}>
        <div className="demo-logo" />
        <Menu
          theme="dark"
          mode="horizontal"
          selectedKeys={[selectedTopKey]}
          items={items1}
          style={{ flex: 1, minWidth: 0 }}
          onClick={({ key }) => handleTopMenuClick(key)}
        />
      </Header>
      <Layout style={{ padding: '24px' }}>
        <Sider style={{ background: '#0f172a' }} width={200}>
          <Menu
            theme="dark"
            mode="inline"
            selectedKeys={[selectedKey]}
            defaultOpenKeys={['class1']}
            style={{ height: '100%' }}
            items={items2}
            onClick={({ key }) => setSelectedKey(key)}
          />
        </Sider>
        <Content style={{ 
          minHeight: 280,
        }}>
          {renderContent()}
        </Content>
      </Layout>
      <Footer style={{ textAlign: 'center', background: '#0f172a', color: '#e2e8f0' }}>
        Attendance Tracker ©{new Date().getFullYear()}
      </Footer>
    </Layout>
  );
}

export default HomePage; 