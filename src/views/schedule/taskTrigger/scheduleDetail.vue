<template>
  <div class="app-container">

    <!--调度比较数据-->
    <el-row>
      <el-col :span="24" align="center" style="font-weight:bold;font-size: 16px;color:#6495ED;">
        <el-card>
          <el-col :span="24" class="card-box">
            <div>
              <el-descriptions class="margin-top" :column="1" :size="'5'" border :labelStyle="{width: '160px'}" >
                <el-descriptions-item>
                  <template slot="label">
                    <i class="el-icon-date"></i>
                    加入调度器时间
                  </template>
                  <div class="cell">
                    {{ scheduleInfo.addToScheduleTime +' ('+scheduleInfo.tillNow+')'}}
                  </div>
                </el-descriptions-item>
                <el-descriptions-item>
                  <template slot="label">
                    <i class="el-icon-message-solid"></i>
                    调度运行状态
                  </template>
                  <div class="cell">
                    <span v-if="scheduleInfo.isExecuting==true" class="link-type" style="color:red ;">
                      <i class="el-icon-loading"></i>正在运行中
                    </span>
                    <span v-else>未运行</span>
                  </div>
                </el-descriptions-item>
              </el-descriptions>
            </div>
          </el-col>
        </el-card>
      </el-col>
    </el-row>
    <el-divider content-position="center">数据比对</el-divider>
    <el-row>
      <!--数据-->
      <div style="padding: 0px 20px 0px 20px;">
        <el-steps align-center>
          <el-step title="数据库中数据" status="finish" icon="el-icon-coin"></el-step>
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
  import {tillNowSeconds,tillNowString} from "@/utils/datetime";


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
        let ts = tillNowSeconds(null,response.addToScheduleTime);
        let tillNow = tillNowString(ts);
        this.scheduleInfo = {
          addToScheduleTime:response.addToScheduleTime,
          tillNow:tillNow,
          isExecuting:response.isExecuting
        };
      });
    }
  }
};
</script>
