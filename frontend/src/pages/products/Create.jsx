import React from 'react';
import { Form, Input, InputNumber, Select, Button, Card, message } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/request';

const { Option } = Select;

const ProductCreate = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();

  const handleSubmit = async (values) => {
    try {
      await api.post('/products', values);
      message.success('商品添加成功');
      navigate('/products');
    } catch (error) {
      message.error('添加商品失败');
    }
  };

  return (
    <Card
      title={
        <span>
          <ArrowLeftOutlined 
            style={{ marginRight: 8, cursor: 'pointer' }} 
            onClick={() => navigate('/products')} 
          />
          添加商品
        </span>
      }
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
          <InputNumber style={{ width: '100%' }} min={1} />
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
          <Button onClick={() => navigate('/products')}>
            取消
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default ProductCreate;