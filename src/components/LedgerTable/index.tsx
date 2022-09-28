import React from 'react';
import moment from 'moment';
import type { ProColumns } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';
import { Space,Button } from 'antd';

const valueEnum = {
  0: 'close',
  1: 'running',
  2: 'online',
  3: 'error',
};

export type TableListItem = {
  key: number;
  name: string;
  status: string | number;
  updatedAt: number;
  createdAt: number;
  progress: number;
  money: number;
  percent: number | string;
  createdAtRange: number[];
  code: string;
  avatar: string;
  image: string;
};
const tableListDataSource: TableListItem[] = [];

for (let i = 0; i < 2; i += 1) {
  tableListDataSource.push({
    key: i,
    avatar:
      'https://gw.alipayobjects.com/zos/antfincdn/efFD%24IOql2/weixintupian_20170331104822.jpg',
    image: 'https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png',
    name: `TradeCode ${i}`,
    status: valueEnum[Math.floor(Math.random() * 10) % 4],
    updatedAt: moment('2019-11-16 12:50:26').valueOf() - Math.floor(Math.random() * 1000),
    createdAt: moment('2019-11-16 12:50:26').valueOf() - Math.floor(Math.random() * 2000),
    createdAtRange: [
      moment('2019-11-16 12:50:26').valueOf() - Math.floor(Math.random() * 2000),
      moment('2019-11-16 12:50:26').valueOf() - Math.floor(Math.random() * 2000),
    ],
    money: Math.floor(Math.random() * 2000) * i,
    progress: Math.ceil(Math.random() * 100) + 1,
    percent:
      Math.random() > 0.5
        ? ((i + 1) * 10 + Math.random()).toFixed(3)
        : -((i + 1) * 10 + Math.random()).toFixed(2),
    code: `const getData = async params => {
  const data = await getData(params);
  return { list: data.data, ...data };
};`,
  });
}

const columns: ProColumns<TableListItem>[] = [
  {
    title: '序号',
    dataIndex: 'index',
    valueType: 'index',
  },
  {
    title: 'border 序号',
    dataIndex: 'index',
    key: 'indexBorder',
    valueType: 'indexBorder',
  },
  {
    title: '代码',
    key: 'code',
    width: 120,
    dataIndex: 'code',
    valueType: 'code',
  },
  {
    title: '头像',
    dataIndex: 'avatar',
    key: 'avatar',
    valueType: 'avatar',
    width: 150,
    render: (dom) => (
      <Space>
        <span>{dom}</span>
        <a href="https://github.com/chenshuai2144" target="_blank" rel="noopener noreferrer">
          chenshuai2144
        </a>
      </Space>
    ),
  },
];

type LedgerTableProps={
    columns: ProColumns<TableListItem>[]
    params:{},
    
}

const LedgerTable:React.FC<LedgerTableProps>= (props) => (
  <div style={{width:'600px'}}>
      <div>统计数据</div>
    
    <ProTable<TableListItem>
      columns={columns}
      params={{}}
      rowSelection={{}}
      request={() => {
        return Promise.resolve({
          total: 200,
          data: tableListDataSource,
          success: true,
        });
      }}

      rowKey="key"
      options={{fullScreen:false,density:false,reload:false}}
      search={false}
      scroll={{x:400}}
      toolBarRender={(_, { selectedRowKeys }) => [   //配置绿色框中的内容
        <Button key="3" type="primary">
          新建
        </Button>,
      ]}
      headerTitle={<Button key="3" type="primary">
      新建
    </Button>}
    />
  </div>
);


export default LedgerTable