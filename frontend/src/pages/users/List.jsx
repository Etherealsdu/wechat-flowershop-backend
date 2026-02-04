import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Modal, Form, Input, InputNumber, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import api from '../utils/request';
import moment from 'moment';

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [form] = Form.useForm();

  // 加载用户列表
  const fetchUsers = async (params = {}) => {
    setLoading(true);
    try {
      const response = await api.get('/users', {
        params: {
          page: params.current || pagination.current,
          pageSize: params.pageSize || pagination.pageSize,
        },
      });
      setUsers(response.data.data);
      setPagination({
        current: response.data.pagination.page,
        pageSize: response.data.pagination.pageSize,
        total: response.data.pagination.total,
      });
    } catch (error) {
      message.error('获取用户列表失败');
    } finally {
      setLoading(false);
    }
  };

  // 组件挂载时加载数据
  useEffect(() => {
    fetchUsers();
  }, []);

  // 表格分页变化
  const handleTableChange = (newPagination) => {
    fetchUsers({
      current: newPagination.current,
      pageSize: newPagination.pageSize,
    });
  };

  // 显示新增用户模态框
  const showAddModal = () => {
    setEditingUser(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  // 显示编辑用户模态框
  const showEditModal = (record) => {
    setEditingUser(record);
    form.setFieldsValue({
      ...record,
    });
    setIsModalVisible(true);
  };

  // 提交表单
  const handleSubmit = async (values) => {
    try {
      if (editingUser) {
        // 编辑用户
        await api.put(`/users/${editingUser.id}`, values);
        message.success('用户更新成功');
      } else {
        // 新增用户 - 实际上在管理后台不会新增用户，这里仅作演示
        message.error('不能通过管理后台新增用户');
        return;
      }
      
      setIsModalVisible(false);
      form.resetFields();
      fetchUsers(); // 刷新列表
    } catch (error) {
      message.error(editingUser ? '更新用户失败' : '添加用户失败');
    }
  };

  // 删除用户
  const handleDelete = async (id) => {
    try {
      await api.delete(`/users/${id}`);
      message.success('用户删除成功');
      fetchUsers(); // 刷新列表
    } catch (error) {
      message.error('删除用户失败');
    }
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: 'OpenID',
      dataIndex: 'openid',
      key: 'openid',
      ellipsis: true,
    },
    {
      title: '昵称',
      dataIndex: 'nickname',
      key: 'nickname',
    },
    {
      title: '手机号',
      dataIndex: 'phone',
      key: 'phone',
    },
    {
      title: '注册时间',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date) => moment(date).format('YYYY-MM-DD HH:mm:ss'),
    },
    {
      title: '最后更新',
      dataIndex: 'updated_at',
      key: 'updated_at',
      render: (date) => moment(date).format('YYYY-MM-DD HH:mm:ss'),
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button type="link" onClick={() => showEditModal(record)}>编辑</Button>
          <Button type="link" danger onClick={() => handleDelete(record.id)}>删除</Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <Button type="primary" icon={<PlusOutlined />} disabled>
          添加用户
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={users}
        rowKey="id"
        loading={loading}
        pagination={pagination}
        onChange={handleTableChange}
      />

      <Modal
        title={editingUser ? '编辑用户' : '添加用户'}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            name="nickname"
            label="昵称"
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="phone"
            label="手机号"
          >
            <Input />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" style={{ marginRight: 8 }}>
              保存
            </Button>
            <Button onClick={() => setIsModalVisible(false)}>
              取消
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default UserList;