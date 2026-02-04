import React from 'react';
import { Card, Row, Col, Statistic, Table } from 'antd';
import { ShoppingCartOutlined, UserOutlined, ShopOutlined, DollarOutlined } from '@ant-design/icons';

const Dashboard = () => {
  // 模拟数据
  const statsData = [
    {
      title: '总销售额',
      value: 123456.78,
      icon: <DollarOutlined style={{ fontSize: 24 }} />,
      color: '#3f8600',
    },
    {
      title: '订单数量',
      value: 1234,
      icon: <ShoppingCartOutlined style={{ fontSize: 24 }} />,
      color: '#1890ff',
    },
    {
      title: '用户数量',
      value: 567,
      icon: <UserOutlined style={{ fontSize: 24 }} />,
      color: '#722ed1',
    },
    {
      title: '商品数量',
      value: 89,
      icon: <ShopOutlined style={{ fontSize: 24 }} />,
      color: '#52c41a',
    },
  ];

  const dataSource = [
    {
      key: '1',
      name: '玫瑰花束',
      category: '鲜花',
      sales: 120,
      revenue: 2400.00,
    },
    {
      key: '2',
      name: '向日葵花束',
      category: '鲜花',
      sales: 98,
      revenue: 1960.00,
    },
    {
      key: '3',
      name: '康乃馨花束',
      category: '鲜花',
      sales: 75,
      revenue: 1500.00,
    },
    {
      key: '4',
      name: '百合花束',
      category: '鲜花',
      sales: 62,
      revenue: 1240.00,
    },
    {
      key: '5',
      name: '郁金香花束',
      category: '鲜花',
      sales: 55,
      revenue: 1100.00,
    },
  ];

  const columns = [
    {
      title: '商品名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '分类',
      dataIndex: 'category',
      key: 'category',
    },
    {
      title: '销量',
      dataIndex: 'sales',
      key: 'sales',
    },
    {
      title: '销售额',
      dataIndex: 'revenue',
      key: 'revenue',
      render: (text) => `¥${text}`,
    },
  ];

  return (
    <div>
      <h1>仪表盘</h1>
      <Row gutter={16}>
        {statsData.map((stat, index) => (
          <Col span={6} key={index}>
            <Card>
              <Statistic
                title={stat.title}
                value={stat.value}
                prefix={stat.icon}
                valueStyle={{
                  color: stat.color,
                  fontSize: '24px',
                }}
              />
            </Card>
          </Col>
        ))}
      </Row>

      <Row gutter={16} style={{ marginTop: 24 }}>
        <Col span={24}>
          <Card title="热销商品">
            <Table dataSource={dataSource} columns={columns} pagination={false} />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;