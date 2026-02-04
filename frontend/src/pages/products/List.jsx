import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Modal, Form, Input, Select, InputNumber, Upload, message } from 'antd';
import { PlusOutlined, UploadOutlined } from '@ant-design/icons';
import api from '../utils/request';
import moment from 'moment';

const { Option } = Select;

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [form] = Form.useForm();
  const [categories, setCategories] = useState([]);

  // 加载商品列表
  const fetchProducts = async (params = {}) => {
    setLoading(true);
    try {
      const response = await api.get('/products', {
        params: {
          page: params.current || pagination.current,
          pageSize: params.pageSize || pagination.pageSize,
        },
      });
      setProducts(response.data.data);
      setPagination({
        current: response.data.pagination.page,
        pageSize: response.data.pagination.pageSize,
        total: response.data.pagination.total,
      });
    } catch (error) {
      message.error('获取商品列表失败');
    } finally {
      setLoading(false);
    }
  };

  // 加载分类列表
  const fetchCategories = async () => {
    try {
      const response = await api.get('/categories');
      setCategories(response.data);
    } catch (error) {
      message.error('获取分类列表失败');
    }
  };

  // 组件挂载时加载数据
  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  // 表格分页变化
  const handleTableChange = (newPagination) => {
    fetchProducts({
      current: newPagination.current,
      pageSize: newPagination.pageSize,
    });
  };

  // 显示新增商品模态框
  const showAddModal = () => {
    setEditingProduct(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  // 显示编辑商品模态框
  const showEditModal = (record) => {
    setEditingProduct(record);
    form.setFieldsValue({
      ...record,
      category_id: record.category_id,
    });
    setIsModalVisible(true);
  };

  // 提交表单
  const handleSubmit = async (values) => {
    try {
      if (editingProduct) {
        // 编辑商品
        await api.put(`/products/${editingProduct.id}`, values);
        message.success('商品更新成功');
      } else {
        // 新增商品
        await api.post('/products', values);
        message.success('商品添加成功');
      }
      
      setIsModalVisible(false);
      form.resetFields();
      fetchProducts(); // 刷新列表
    } catch (error) {
      message.error(editingProduct ? '更新商品失败' : '添加商品失败');
    }
  };

  // 删除商品
  const handleDelete = async (id) => {
    try {
      await api.delete(`/products/${id}`);
      message.success('商品删除成功');
      fetchProducts(); // 刷新列表
    } catch (error) {
      message.error('删除商品失败');
    }
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: '商品名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '价格',
      dataIndex: 'price',
      key: 'price',
      render: (price) => `¥${price}`,
    },
    {
      title: '原价',
      dataIndex: 'original_price',
      key: 'original_price',
      render: (originalPrice) => originalPrice ? `¥${originalPrice}` : '-',
    },
    {
      title: '库存',
      dataIndex: 'stock',
      key: 'stock',
    },
    {
      title: '分类',
      dataIndex: ['category', 'name'],
      key: 'category',
    },
    {
      title: '状态',
      dataIndex: 'is_active',
      key: 'is_active',
      render: (isActive) => isActive ? '上架' : '下架',
    },
    {
      title: '销量',
      dataIndex: 'sales_count',
      key: 'sales_count',
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
          添加商品
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={products}
        rowKey="id"
        loading={loading}
        pagination={pagination}
        onChange={handleTableChange}
      />

      <Modal
        title={editingProduct ? '编辑商品' : '添加商品'}
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
            label="商品名称"
            rules={[{ required: true, message: '请输入商品名称' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="description"
            label="商品描述"
          >
            <Input.TextArea rows={4} />
          </Form.Item>

          <Form.Item
            name="price"
            label="价格"
            rules={[{ required: true, message: '请输入价格' }]}
          >
            <InputNumber
              style={{ width: '100%' }}
              min={0}
              step={0.01}
              precision={2}
              formatter={(value) => `¥ ${value}`}
              parser={(value) => value.replace('¥ ', '')}
            />
          </Form.Item>

          <Form.Item
            name="original_price"
            label="原价"
          >
            <InputNumber
              style={{ width: '100%' }}
              min={0}
              step={0.01}
              precision={2}
              formatter={(value) => `¥ ${value}`}
              parser={(value) => value.replace('¥ ', '')}
            />
          </Form.Item>

          <Form.Item
            name="stock"
            label="库存"
            rules={[{ required: true, message: '请输入库存' }]}
          >
            <InputNumber style={{ width: '100%' }} min={0} />
          </Form.Item>

          <Form.Item
            name="category_id"
            label="分类"
            rules={[{ required: true, message: '请选择分类' }]}
          >
            <Select placeholder="请选择分类">
              {categories.map(category => (
                <Option key={category.id} value={category.id}>{category.name}</Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="image_urls"
            label="商品图片"
          >
            <Upload
              name="files"
              action="/upload"
              listType="picture"
              accept="image/*"
              maxCount={5}
            >
              <Button icon={<UploadOutlined />}>上传图片</Button>
            </Upload>
          </Form.Item>

          <Form.Item
            name="is_active"
            label="状态"
            initialValue={true}
          >
            <Select>
              <Option value={true}>上架</Option>
              <Option value={false}>下架</Option>
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

export default ProductList;