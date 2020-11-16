<template>
  <div class="app-container">
    <el-form :inline="true">
      <el-form-item label="选择日期">
        <el-date-picker type="date"
          v-model="date"
          format="yyyy-MM-dd"
          value-format="yyyy-MM-dd"
          :style="{width: '140px'}"
          placeholder="请选择日期"
          size="small"
          @change="handleQuery"
          >
        </el-date-picker>
      </el-form-item>
      <el-form-item label="数据来源">
       <el-select
         v-model="dataSource"
         @change="handleQuery"
         placeholder="数据来源"
         collapse-tags
         size="small"
         style="width: 100px"
       >
         <el-option
           v-for="dict in dataSourceOptions"
           :key="dict.id"
           :label="dict.text"
           :value="dict.id"
         />
       </el-select>
      </el-form-item>
      <el-form-item label="排序方式" prop="reverse">
        <el-select
          v-model="reverse"
          placeholder="排序方式"
          size="small"
          style="width: 80px"
        >
          <el-option
            v-for="dict in reverseOptions"
            :key="dict.id"
            :label="dict.text"
            :value="dict.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="query" icon="el-icon-search" size="mini" @click="handleQuery" >搜索</el-button>
        <el-button type="query" icon="el-icon-d-arrow-left" size="mini" @click="getCalendarDev(-1)" >前一天</el-button>
        <el-button type="query" icon="el-icon-d-arrow-right" size="mini" @click="getCalendarDev(1)" >后一天</el-button>
      </el-form-item>
    </el-form>

    <el-timeline v-loading="loading" :reverse="reverse" >
      <template v-for="item in activities">
          <el-timeline-item :timestamp="item.timestamp" :type="item.type" placement="top">
            <el-card class="box-card">
              <div slot="header" class="clearfix">
                <svg-icon :icon-class="item.icon" />
                <span>
                  {{ item.behaviorTypeName }}
                </span>
                <el-tag v-if="true==item.allDay" type="danger">全天</el-tag>
                <el-button v-if="true==item.allDay" size="mini" type="text" style="color: green;float: right; padding: 3px 0" icon="el-icon-date">
                  {{ item.dateRange }}
                </el-button>
              </div>
              <div>
                <p>{{item.content}}</p>
              </div>
            </el-card>
          </el-timeline-item>
        </template>
      </el-timeline>
  </div>
</template>

<script>
  import {getUserBehaviorCalendarStat} from "@/api/behavior/userBehavior";
  import {getUserOperationConfigStat} from "@/api/behavior/userOperationConfig";
  import {getNowDateString,getDayByDate} from "@/utils/datetime";
  import {getBussIconClass} from "@/utils/planUtils";

export default {
  data() {
    return {
      reverse:false,
      loading:false,
      reverseOptions:[
        {
          id: true,
          text: '倒序'
        },
        {
          id: false,
          text: '顺序'
        }
      ],
      activities:[],
      dataSourceOptions:[],
      date:getNowDateString(),
      dataSource:'BEHAVIOR_DATA'
    };
  },
  created() {
    this.getDictItemTree('USER_BEHAVIOR_DATA_SOURCE',false).then(response => {
      this.dataSourceOptions = response;
    });
    this.getList();
  },
  methods: {
    getCalendarDev(n) {
      let dd = this.date;
      dd = getDayByDate(n,dd);
      this.date = dd;
      this.handleQuery();
    },
    /** 查询列表 */
    getList() {
      if(this.dataSource=='BEHAVIOR_DATA'){
        this.getUserBehaviorList(this.date, this.date);
      }else{
        this.getUserOperationList(this.date, this.date);
      }
    },
    //用户行为数据
    getUserBehaviorList(startDate,endDate) {
      this.loading=true;
      let para={
        startDate:startDate,
        endDate:endDate
      };
      getUserBehaviorCalendarStat(para).then(
        response => {
          this.activities = new Array();
          let datas = response;
          const n = datas.length;
          for(let i=0;i<n;i++){
            let timestamp="00:00";
            if(datas[i].bussDay.length>11){
              timestamp=datas[i].bussDay.substring(11,16);
            }
            let row = {
              content:datas[i].content,
              timestamp:timestamp,
              type: 'primary',
              behaviorTypeName:datas[i].behaviorTypeName,
              allDay:datas[i].allDay
            };
            row.dateRange = datas[i].bussDay.substring(0,10);
            if(datas[i].expireTime!=null){
              row.dateRange+='~'+datas[i].expireTime.substring(0,10);
            }
            row.icon=getBussIconClass(datas[i].behaviorType);
            this.activities.push(row);
          }
          this.sortResult(this.activities);
          this.loading=false;
        }
      );
    },
    //用户操作数据
    getUserOperationList(startDate,endDate) {
      this.loading=true;
      let para = {
        startTime: startDate,
        endTime: endDate+' 23:59:59',
        page:0
      };
      getUserOperationConfigStat(para).then(response => {
        this.activities = new Array();
          let datas = response;
          for(let i=0; i<datas.length; i++){
            let pdata =datas[i].operations;
            for(let j=0;j<pdata.length;j++){
              let data = pdata[j];
              let timestamp="00:00";
              if(data.occurTime.length>11){
                timestamp=data.occurTime.substring(11,16);
              }
              let row = {
                content:data.content,
                timestamp:timestamp,
                type: 'primary',
                behaviorTypeName:data.behaviorTypeName
              };
              row.icon=getBussIconClass(data.behaviorType);
              row.allDay = false;
              this.activities.push(row);
            }
          }
          this.sortResult(this.activities);
          this.loading=false;
      });
    },
    /** 排序 */
    sortResult(datas){
      //冒泡排序
      for(let j=0;j<datas.length-1;j++){
      //两两比较，如果前一个比后一个大，则交换位置。
       for(let i=0;i<datas.length-1-j;i++){
            if(datas[i].timestamp>datas[i+1].timestamp){
                let temp = datas[i];
                datas[i] = datas[i+1];
                datas[i+1] = temp;
            }
        }
      }
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.getList();
    }
  }
};
</script>
