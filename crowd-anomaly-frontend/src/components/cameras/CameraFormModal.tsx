import React, { useEffect } from 'react';
import { Modal, Form, Input, Select, Button } from 'antd';
import { Camera, CameraFormData } from '@/types';

interface CameraFormModalProps {
  open: boolean;
  camera?: Camera | null;
  onClose: () => void;
  onSubmit: (data: CameraFormData) => Promise<void>;
  isLoading?: boolean;
}

const CameraFormModal: React.FC<CameraFormModalProps> = ({ open, camera, onClose, onSubmit, isLoading }) => {
  const [form] = Form.useForm<CameraFormData>();
  const isEdit = !!camera;

  useEffect(() => {
    if (open) {
      if (camera) {
        form.setFieldsValue({ name: camera.name, location: camera.location, rtspUrl: camera.rtspUrl, status: camera.status });
      } else {
        form.resetFields();
        form.setFieldValue('status', 'ACTIVE');
      }
    }
  }, [open, camera, form]);

  const handleFinish = async (values: CameraFormData) => {
    await onSubmit(values);
    form.resetFields();
  };

  return (
    <Modal
      open={open}
      title={<span style={{ fontWeight: 700 }}>{isEdit ? 'Edit Camera' : 'Add Camera'}</span>}
      onCancel={onClose}
      footer={null}
      width={520}
      destroyOnHidden
    >
      <Form form={form} layout="vertical" onFinish={handleFinish} size="large" style={{ marginTop: 16 }}>
        <Form.Item name="name" label="Camera Name" rules={[{ required: true, message: 'Camera name is required' }]}>
          <Input placeholder="e.g. Entrance Gate - North" style={{ borderRadius: 10 }} />
        </Form.Item>

        <Form.Item name="location" label="Location" rules={[{ required: true, message: 'Location is required' }]}>
          <Input placeholder="e.g. Gate 1, Main Building" style={{ borderRadius: 10 }} />
        </Form.Item>

        <Form.Item
          name="rtspUrl"
          label="RTSP URL"
          rules={[
            { required: true, message: 'RTSP URL is required' },
            { pattern: /^rtsp:\/\/.+/, message: 'Must be a valid RTSP URL (rtsp://...)' },
          ]}
        >
          <Input placeholder="rtsp://192.168.1.100:554/stream" style={{ borderRadius: 10 }} />
        </Form.Item>

        <Form.Item name="status" label="Status" rules={[{ required: true }]}>
          <Select style={{ borderRadius: 10 }}>
            <Select.Option value="ACTIVE">Active</Select.Option>
            <Select.Option value="INACTIVE">Inactive</Select.Option>
            <Select.Option value="MAINTENANCE">Maintenance</Select.Option>
          </Select>
        </Form.Item>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 8 }}>
          <Button onClick={onClose} style={{ borderRadius: 10 }}>Cancel</Button>
          <Button
            type="primary" htmlType="submit" loading={isLoading}
            style={{ background: 'linear-gradient(135deg, #00d4ff, #7c3aed)', border: 'none', borderRadius: 10, fontWeight: 600 }}
          >
            {isEdit ? 'Update Camera' : 'Add Camera'}
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default CameraFormModal;
