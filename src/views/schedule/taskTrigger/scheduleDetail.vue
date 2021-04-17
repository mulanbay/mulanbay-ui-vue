<template>
  <div class="app-container">

    <!--调度比较数据-->
    <el-row>
      <el-col :span="24" align="center" style="font-weight:bold;font-size: 16px;color:#6495ED;">
        <div class="el-table el-table--enable-row-hover el-table--medium">
          <table cellspacing="0" style="width: 100%;">
            <tbody>
              <tr>
                <td><div class="cell"><i class="el-icon-info"></i>加入调度器时间</div></td>
                <td>
                  <div class="cell">
                    <span class="table-title">{{ scheduleInfo.addToScheduleTime }}</span>
                  </div>
                </td>
              </tr>
              <tr>
                <td><div class="cell"><i class="el-icon-info"></i>调度状态</div></td>
                <td>
                  <div class="cell">
                    <span class="table-title">{{ scheduleInfo.statusInfo }}</span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </el-col>
    </el-row>
    <el-row>
      <!--数据-->
      <div style="padding: 0px 20px 0px 20px;">
        <el-steps>
          <el-step title="数据库中数据" status="finish" icon="el-icon-edit"></el-step>
          <el-step title="调度服务器中数据" status="finish" icon="el-icon-upload"></el-step>
        </el-steps>
      </div>
    </el-row>
    <el-row>
      <el-col :span="12">
        <el-card>
          <el-table
            :data="dbData"
            row-key="id"
            :tree-props="{children: 'children', hasChildren: 'hasChildren'}">
            <el-table-column label="字段" align="center">
              <template slot-scope="{row}">
                <span>{{ row.id }}</span>
              </template>
            </el-table-column>
            <el-table-column label="值"  :show-overflow-tooltip="true">
              <template slot-scope="{row}">
                <span>{{ row.text }}</span>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card>
          <el-table
            :data="scheduleData"
            row-key="id"
            :tree-props="{children: 'children', hasChildren: 'hasChildren'}">
            <el-table-column label="字段" align="center">
              <template slot-scope="{row}">
                <span>{{ row.id }}</span>
              </template>
            </el-table-column>
            <el-table-column label="值"  :show-overflow-tooltip="true">
              <template slot-scope="{row}">
                <span>{{ row.text }}</span>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>

  </div>
</template>

<script>
  import {getScheduleDetail} from "@/api/schedule/taskTrigger";
  import {parseJsonToTree} from "@/utils/mulanbay";

export default {
  name: "TaskTriggerScheduleDetail",
  props: {
    //父层带过来的列表值
    triggerData: {
      id:undefined
    }
  },
  data() {
    return {
      defaultProps: {
        children: "children",
        label: "text"
      },
      scheduleInfo:{},
      //数据库里面的数据
      dbData:[],
      //调度服务器里的数据
      scheduleData:[]
    };
  },
  created() {
    this.handleReceiveData(this.triggerData);
  },
  //监听父层带过来的账户信息值
  watch:{
    triggerData(newVal,oldVal){
      this.triggerData = newVal;
      this.handleReceiveData(this.triggerData);
    }
  },
  methods: {
    //处理数据
    handleReceiveData(data){
      getScheduleDetail(data.id).then(response => {
        this.dbData = parseJsonToTree(response.dbInfo);
        //console.log(JSON.stringify(this.dbData));
        this.scheduleData = parseJsonToTree(response.scheduleInfo);
        let ss ='';
        if(response.isExecuting!=null&&response.isExecuting==true){
          ss+='正在运行中';
        }else{
          ss+='未运行';
        }
        this.scheduleInfo = {
          addToScheduleTime:response.addToScheduleTime,
          statusInfo:ss
        };
      });
    }
  }
};
</script>
