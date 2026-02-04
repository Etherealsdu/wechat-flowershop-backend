import React from 'react';
import { Layout, Menu, theme } from 'antd';
import {
  HomeOutlined,
  ShoppingCartOutlined,
  UserOutlined,
  ShopOutlined,
  AppstoreOutlined,
  FileTextOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import { Routes, Route, useNavigate, Link } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import ProductList from './pages/products/List';
import ProductCreate from './pages/products/Create';
import CategoryList from './pages/categories/List';
import OrderList from './pages/orders/List';
import UserList from './pages/users/List';

const { Header, Content, Sider } = Layout;

const App = () => {
  const navigate = useNavigate();
  const {
    token: { colorBgContainer },
  } = theme.useToken();

  const menuItems = [
    {
      key: '/',
      icon: <HomeOutlined />,
      label: '首页',
    },
    {
      key: '/products',
      icon: <ShopOutlined />,
      label: '商品管理',
      children: [
        {
          key: '/products',
          label: '商品列表',
        },
        {
          key: '/products/create',
          label: '添加商品',
        },
      ],
    },
    {
      key: '/categories',
      icon: <AppstoreOutlined />,
      label: '分类管理',
    },
    {
      key: '/orders',
      icon: <FileTextOutlined />,
      label: '订单管理',
    },
    {
      key: '/users',
      icon: <UserOutlined />,
      label: '用户管理',
    },
    {
      key: '/settings',
      icon: <SettingOutlined />,
      label: '系统设置',
    },
  ];

  const onClickMenu = (e) => {
    navigate(e.key);
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        breakpoint="lg"
        collapsedWidth="0"
        onBreakpoint={(broken) => {
          console.log(broken);
        }}
        onCollapse={(collapsed, type) => {
          console.log(collapsed, type);
        }}
      >
        <div className="demo-logo-vertical" />
        <Menu
          theme="dark"
          mode="inline"
          defaultSelectedKeys={['/']}
          items={menuItems}
          onClick={onClickMenu}
        />
      </Sider>
      <Layout>
        <Header style={{ padding: 0, background: colorBgContainer }} />
        <Content style={{ margin: '24px 16px 0' }}>
          <div style={{ padding: 24, minHeight: 360, background: colorBgContainer }}>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/products" element={<ProductList />} />
              <Route path="/products/create" element={<ProductCreate />} />
              <Route path="/categories" element={<CategoryList />} />
              <Route path="/orders" element={<OrderList />} />
              <Route path="/users" element={<UserList />} />
            </Routes>
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default App;