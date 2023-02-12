<template>
  <div class="app-container">

    <!--列表数据-->
    <el-timeline v-loading="loading" :reverse="reverse" >
      <template v-for="item in dataList">
        <el-timeline-item :timestamp="item.timestamp" :type="item.type" placement="top">
          <el-card class="box-card">
            <div>
              <el-descriptions class="margin-top" :column="1" :size="size" border >
                <el-descriptions-item>
                  <template slot="label" >
                    <i class="el-icon-warning"></i>
                    调度名称
                  </template>
                  <div class="cell" align="center">{{ item.content }}</div>
                </el-descriptions-item>
                <el-descriptions-item>
                  <template slot="label" >
                    <i class="el-icon-date"></i>
                    剩余时间
                  </template>
                  <div class="cell">
                    <el-statistic ref="statistic" format="HH:mm:ss" :value="item.nextExecuteTime" title="距离现在" time-indices > </el-statistic>
                  </div>
                </el-descriptions-item>
              </el-descriptions>
            </div>
          </el-card>
        </el-timeline-item>
      </template>
    </el-timeline>

    <br><br>
    <div slot="footer" class="dialog-footer" align="right">
      <el-button type="stat" @click="refresh" v-hasPermi="['schedule:taskLog:redo']">刷新</el-button>
    </div>
  </div>
</template>

<script>
  import {recentSchedules} from "@/api/schedule/taskTrigger";
  import {getNowDateString} from "@/utils/datetime";

export default {
  name: "TaskTriggerRecentSchedules",
  data() {
    return {
      reverse:false,
      loading:false,
      //列表数据
      dataList:[]
    };
  },
  created() {
    this.getScheduleLIst();
  },
  methods: {
    //刷新
    refresh(){
      this.getScheduleLIst();
    },
    getScheduleLIst(){
      this.loading = true;
      recentSchedules().then(response => {
        this.dataList = new Array();
        let datas = response;
        const n = datas.length;
        const now = getNowDateString();
        for(let i=0;i<n;i++){
          let timestamp=datas[i].nextExecuteTime.substr(11,5);
          if(datas[i].nextExecuteTime.substr(0,10)!=now){
            timestamp+='(明天)';
          }
          let net = (datas[i].nextExecuteTime==null ? datas[i].firstExecuteTime : datas[i].nextExecuteTime);
          let row = {
            content:datas[i].name,
            timestamp:timestamp,
            nextExecuteTime: (new Date(net.replace(/-/,"/"))),
            type: 'primary'
          };
          this.dataList.push(row);
        }
        this.loading=false;
      });
    }
  }
};
</script>
