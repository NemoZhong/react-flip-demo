import { Table } from 'antd';
import {connect} from 'dva'


const Index=()=>{
  return (
    <div style={{width:'600px'}}>

    <Table columns={columns} dataSource={data} scroll={{ x: 1000,y:400 }} />
    </div>
  )
}