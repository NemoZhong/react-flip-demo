import React, { useState,useContext ,useMemo} from 'react';
import {
  SettingOutlined,
} from '@ant-design/icons';
import type { TableColumnType } from 'antd';
import { Switch, Popover, ConfigProvider, Tooltip,Table,Checkbox } from 'antd';
import classNames from 'classnames';
import omit from 'omit.js';
import { genColumnKey } from '../utils/index';
import type { ProColumns } from '../utils/typing';
import Container from '../utils/container'
import type { ColumnsState } from '../utils/container';
import './index.less';

type ColumnSettingProps<T = any> = {
  columns: TableColumnType<T>[];
  draggable?: boolean;
  checkable?: boolean;
};


function ColumnSetting<T>(props: ColumnSettingProps<T>) {
  const counter = Container.useContainer();
  const localColumns: TableColumnType<T> &
    {
      index?: number;
      fixed?: any;
      key?: any;
    }[] = props.columns.map(column=>({...column, show:true,
      fixed:false}));

  const { columnsMap, setColumnsMap } = counter;


  // 选中的 key 列表
  const selectedKeys = Object.values(columnsMap).filter((value) => !value || value.show === false);

  const { getPrefixCls } = useContext(ConfigProvider.ConfigContext);
  const className = getPrefixCls('pro-table-column-setting');

  const toggleColumn=(show,columnKey)=>{
    const config = columnsMap[columnKey] || {};
    const columnKeyMap = {
      ...columnsMap,
      [columnKey]: { ...config, show } as ColumnsState,
    };
    setColumnsMap(columnKeyMap);
  }

  const fixColumn=(val,record)=>{
    
  }

  const [columns,setColumns]=useState([{
    title: '显示/隐藏 列',
    key: 'show',
    dataIndex: 'show',
    width: 200,
    render: (_,record)=>{
  
      return (
        <>
          <Switch defaultChecked onChange={(val)=>toggleColumn(val,record.dataIndex)} />
          {record?.title}
        </>
      )
    }
  },{
    title: '是否冻住(最多5项)',
    key: 'show',
    dataIndex: 'show',
    width: 100,
    render:(_,record)=>(<Checkbox disabled={!record.show} onChange={(e)=>fixColumn(e,record)}/>)
  }])


  return (
    <Popover
      
      title={
        false
      }
      overlayClassName={`${className}-overlay`}
      trigger="click"
      placement="bottomRight"
      content={
        <Table dataSource={localColumns} pagination={false} columns={columns} />
      }
    >
      <Tooltip title={'列设置'}>
        <SettingOutlined />
      </Tooltip>
    </Popover>
  );
}

export default ColumnSetting;
