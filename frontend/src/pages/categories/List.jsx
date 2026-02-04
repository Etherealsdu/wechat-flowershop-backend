import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Modal, Form, Input, InputNumber, Select, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import api from '../utils/request';
import moment from 'moment';

const { Option } = Select;

const CategoryList = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [form] = Form.useForm();

  // 加载分类列表
  const fetchCategories = async () => {
    setLoading(true);
    try {
      const response = await api.get('/categories');
      setCategories(response.data);
    } catch (error) {
      message.error('获取分类列表失败');
    } finally {
      setLoading(false);
    }
  };

  // 组件挂载时加载数据
  useEffect(() => {
    fetchCategories();
  }, []);

  // 显示新增分类模态框
  const showAddModal = () => {
    setEditingCategory(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  // 显示编辑分类模态框
  const showEditModal = (record) => {
    setEditingCategory(record);
    form.setFieldsValue({
      ...record,
    });
    setIsModalVisible(true);
  };

  // 提交表单
  const handleSubmit = async (values) => {
    try {
      if (editingCategory) {
        // 编辑分类
        await api.put(`/categories/${editingCategory.id}`, values);
        message.success('分类更新成功');
      } else {
        // 新增分类
        await api.post('/categories', values);
        message.success('分类添加成功');
      }
      
      setIsModalVisible(false);
      form.resetFields();
      fetchCategories(); // 刷新列表
    } catch (error) {
      message.error(editingCategory ? '更新分类失败' : '添加分类失败');
    }
  };

  // 删除分类
  const handleDelete = async (id) => {
    try {
      await api.delete(`/categories/${id}`);
      message.success('分类删除成功');
      fetchCategories(); // 刷新列表
    } catch (error) {
      message.error('删除分类失败');
    }
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: '分类名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: '排序',
      dataIndex: 'sort_order',
      key: 'sort_order',
    },
    {
      title: '状态',
      dataIndex: 'is_active',
      key: 'is_active',
      render: (isActive) => isActive ? '启用' : '禁用',
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      key: 'created_at',
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
        <Button type="primary" icon={<PlusOutlined />} onClick={showAddModal}>
          添加分类
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={categories}
        rowKey="id"
        loading={loading}
      />

      <Modal
        title={editingCategory ? '编辑分类' : '添加分类'}
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
            name="name"
            label="分类名称"
            rules={[{ required: true, message: '请输入分类名称' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="description"
            label="描述"
          >
            <Input.TextArea rows={3} />
          </Form.Item>

          <Form.Item
            name="sort_order"
            label="排序"
            initialValue={0}
          >
            <InputNumber style={{ width: '100%' }} min={0} />
          </Form.Item>

          <Form.Item
            name="is_active"
            label="状态"
            initialValue={true}
          >
            <Select>
              <Option value={true}>启用</Option>
              <Option value={false}>禁用</Option>
            </Select>
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

export default CategoryList;