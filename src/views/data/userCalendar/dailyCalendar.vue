<template>
  <div class="app-container">
    <el-form :inline="true">
      <el-form-item label="选择日期">
        <el-date-picker type="date"
          v-model="bussDay"
          format="yyyy-MM-dd"
          value-format="yyyy-MM-dd"
          :style="{width: '140px'}"
          placeholder="请选择日期"
          size="small"
          @change="handleQuery"
          >
        </el-date-picker>
      </el-form-item>
      <el-form-item>
        <el-button type="query" icon="el-icon-time" size="mini" @click="getCalendarToday" >今天</el-button>
        <el-button type="query" icon="el-icon-d-arrow-left" size="mini" @click="getCalendarDev(-1)" >前一天</el-button>
        <el-button type="query" icon="el-icon-d-arrow-right" size="mini" @click="getCalendarDev(1)" >后一天</el-button>
      </el-form-item>
    </el-form>

    <el-divider content-position="center">
      <i class="el-icon-message-solid"></i>
      <span style="color: red;">{{bussDayTitle}}</span>
    </el-divider>
    <template>
      <el-timeline v-loading="loading" :reverse="reverse" >
        <template v-for="item in dataList">
          <el-timeline-item :timestamp="item.occurTimeStr" :type="item.type" placement="top">
            <el-card class="box-card">
              <div slot="header" class="clearfix">
                <svg-icon icon-class="life" />
                <span>
                  {{item.title}}
                </span>
                <el-button size="mini" type="text" style="color: red;float: right; padding: 3px 0" icon="el-icon-delete" @click="handleDelete(item)"
                  v-if="item.id>0"
                  v-hasPermi="['data:userCalendar:delete']">
                  删除
                </el-button>
                <el-divider direction="vertical"></el-divider>
                <el-button size="mini" type="text" style="color: darkmagenta;float: right; padding: 3px 0" icon="el-icon-close" @click="finishUserCalendar(item)"
                  v-if="'ONCE'==item.period"
                  v-hasPermi="['data:userCalendar:finish']">
                  关闭
                </el-button>
                <el-divider direction="vertical"></el-divider>
                <el-button size="mini" type="text" style="color: royalblue;float: right; padding: 3px 0" icon="el-icon-info" @click="showMessageDetail(item)"
                  v-if="item.messageId!=null"
                  v-hasPermi="['data:userCalendar:finish']">
                  源消息
                </el-button>
              </div>
              <div>
                <el-divider direction="vertical"></el-divider>
                <span>
                  来源:<el-tag>{{item.sourceTypeName}}</el-tag>
                </span>
                <el-divider direction="vertical"></el-divider>
                <span v-if="item.period!=null">
                  {{item.periodName}}
                  <span v-if="!isObjectEmpty(item.periodValues)">
                    <el-tag type="success" >{{ item.periodValues }}</el-tag>
                  </span>
                </span>
                <span v-else>--</span>
                <el-divider direction="vertical"></el-divider>
                <span>
                  延迟:
                  <el-tag type="danger">{{ item.delayCounts }}</el-tag>
                  次
                </span>
                <el-divider direction="vertical"></el-divider>
                <p>{{item.content}}</p>
              </div>
            </el-card>
          </el-timeline-item>
        </template>
      </el-timeline>
    </template>

  </div>
</template>

<script>
  import { getList as getDailyCalendarList,sendCalendarMessage,finishUserCalendar,deleteUserCalendar } from '@/api/data/userCalendar'
  import {getUserMessageByUser} from "@/api/log/userMessage";
  import {getNowDateString,getNowDateTimeString,getDayByDate,tillNowDays} from "@/utils/datetime";

export default {
  name: "UserCalendarDailyCalendar",
  data() {
    return {
      reverse:false,
      loading:false,
      //数据列表
      dataList:[],
      //日期标题
      bussDayTitle:undefined,
      bussDay:getNowDateString()
    };
  },
  created() {
    this.setBussDayTitle();
    this.getList();
  },
  methods: {
    /** 今天 */
    getCalendarToday() {
      this.bussDay = getNowDateString();
      this.setBussDayTitle();
      this.handleQuery();
    },
    /** 前一天/后一天 */
    getCalendarDev(n) {
      let dd = this.bussDay;
      dd = getDayByDate(n,dd);
      this.bussDay = dd;
      this.setBussDayTitle();
      this.handleQuery();
    },
    /** 设置日期标题 */
    setBussDayTitle(){
      const now = new Date(Date.parse(getNowDateString().replace(/-/g,"/")));
      const bd = new Date(Date.parse(this.bussDay.replace(/-/g,"/")));
      const days = tillNowDays(now,bd);
      switch(days){
        case 0:
          this.bussDayTitle='今天,'+this.bussDay.substr(5,5);
          break;
        case 1:
          this.bussDayTitle='明天,'+this.bussDay.substr(5,5);
          break;
        case -1:
          this.bussDayTitle='昨天,'+this.bussDay.substr(5,5);
          break;
        default:
          if(days>0){
            this.bussDayTitle=days+'天后,'+this.bussDay.substr(5,5);
          }else{
            this.bussDayTitle=(0-days)+'天前,'+this.bussDay.substr(5,5);
          }
      }
    },
    /** 源消息内容 */
    showMessageDetail(row){
      getUserMessageByUser(row.messageId).then(
        response => {
          if(response==null){
            this.msgError('未找到相关消息内容');
          }else{
            this.msgAlert(response.title, response.content);
          }
        }
      );
    },
    /** 查询列表 */
    getList() {
      this.getCalendarList();
    },
    //列表数据
    getCalendarList() {
      this.loading=true;
      // 请求接口数据
      const para = {
        startDate:this.bussDay,
        endDate:this.bussDay,
        needTotal:false,
        needFinished:false,
        needPeriod:true,
        needBudget:true,
        needTreatDrug:true,
        needBandLog:false
      }
      getDailyCalendarList(para).then(
        response => {
          let datas = response;
          for(let i=0;i<datas.length;i++){
            let dt = datas[i];
            if(dt.allDay==true){
              dt.occurTimeStr = '全天';
              dt.type='danger';
            }else{
              dt.occurTimeStr = dt.bussDay.substr(11,5);
              dt.type='primary';
            }
          }
          this.dataList = datas;
          this.loading=false;
        }
      );
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.getList();
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const ids = row.id;
      this.$confirm('是否确认删除"' + row.title + '"的日历?', "警告", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }).then(function() {
          return deleteUserCalendar(ids);
        }).then(() => {
          this.getList();
          this.msgSuccess("删除成功");
        }).catch(function() {});
    },
    /** 关闭按钮操作 */
    finishUserCalendar(row){
      this.$confirm('是否确认关闭"' + row.title + '"的日历?', "警告", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }).then(function() {
          return finishUserCalendar(row.id);
        }).then(() => {
          this.getList();
          this.msgSuccess("关闭成功");
        }).catch(function() {});
    }
  }
};
</script>
