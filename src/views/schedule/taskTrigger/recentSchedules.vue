<template>
  <div class="app-container">

    <!--列表数据-->
    <el-timeline v-loading="loading" :reverse="reverse" >
      <template v-for="item in dataList">
        <el-timeline-item :timestamp="item.timestamp" :type="item.type" placement="top">
          <el-card class="box-card">
            <div>
              <p>{{item.content}}</p>
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
          let row = {
            content:datas[i].name,
            timestamp:timestamp,
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
