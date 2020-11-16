<template>
  <el-row :gutter="40" class="panel-group">
    <el-col :xs="12" :sm="12" :lg="6" class="card-panel-col">
      <div class="card-panel" @click="handleDispatch('UserRewardPointRecord')">
        <div class="card-panel-icon-wrapper icon-people">
          <svg-icon icon-class="points" class-name="card-panel-icon" />
        </div>
        <div class="card-panel-description" align="right">
          <div class="card-panel-text">
            今日积分
          </div>
          {{urpData.es}}
          <count-to :start-val="0" :end-val="urpData.totalPoints" :duration="2600" class="card-panel-num" />
        </div>
        <div class="card-panel-description">
          <div class="card-panel-text">
            累计积分
          </div>
          <count-to :start-val="0" :end-val="urpData.currentPoints" :duration="2600" class="card-panel-num" />
        </div>
      </div>
    </el-col>
    <el-col :xs="12" :sm="12" :lg="6" class="card-panel-col">
      <div class="card-panel" @click="handleDispatch('UserMessage')">
        <div class="card-panel-icon-wrapper icon-message">
          <svg-icon icon-class="message" class-name="card-panel-icon" />
        </div>
        <div class="card-panel-description">
          <div class="card-panel-text">
            消息
          </div>
          <count-to :start-val="0" :end-val="newMsgCount" :duration="3000" class="card-panel-num" />
        </div>
      </div>
    </el-col>
    <el-col :xs="12" :sm="12" :lg="6" class="card-panel-col">
      <div class="card-panel" @click="handleDispatch('Budget')">
        <div class="card-panel-icon-wrapper icon-money">
          <svg-icon icon-class="money" class-name="card-panel-icon" />
        </div>
        <div class="card-panel-description" align="right">
          <div class="card-panel-text">
            已经花费
          </div>
          <span style="font-weight:bold;font-size: 18px;">￥</span>
          <count-to :start-val="0" :end-val="(consumeData.monthConsumeAmount+consumeData.totalTreatAmount)" :duration="2600" class="card-panel-num" />
          <br>{{consumeData.rateStr}}
        </div>
        <div class="card-panel-description" align="right">
          <div class="card-panel-text">
            本月预算
          </div>
          <span style="font-weight:bold;font-size: 18px;">￥{{consumeData.monthBudget}}</span>
        </div>
      </div>
    </el-col>
    <el-col :xs="12" :sm="12" :lg="6" class="card-panel-col">
      <div class="card-panel" @click="handleDispatch('UserScore')">
        <div class="card-panel-icon-wrapper icon-shopping">
          <svg-icon icon-class="score" class-name="card-panel-icon" />
        </div>
        <div class="card-panel-description" align="right">
          <div class="card-panel-text">
            用户评分
          </div>
          <count-to :start-val="0" :end-val="score" :duration="3600" class="card-panel-num" />
        </div>
      </div>
    </el-col>
  </el-row>
</template>

<script>
import {dailyStat} from "@/api/data/userRewardPointRecord";
import {generalStat} from "@/api/main";
import {getFirstDayOfMonth,getLastDayOfMonth} from "@/utils/datetime";
import {getPercent} from "@/utils/mulanbay";
import {fetchList as fetchUserScoreList} from "@/api/data/userScore";

import CountTo from 'vue-count-to'

export default {
  name: "PanelGroup",
  components: {
    CountTo
  },
  data() {
    return {
      //用户积分
      urpData:{
        totalCount:0,
        totalPoints:0,
        currentPoints:0,
        es:''
      },
      //本月统计
      consumeData:{
        monthBudget:0,
        monthConsumeAmount:0,
        totalTreatAmount:0
      },
      score:0,
      newMsgCount:0
    };
  },
  created() {
    this.handleUserRewardPointStat();
    this.handleGeneralStat();
    this.handleUserScore();
  },
  methods: {
    //跳转
    handleDispatch(pathName){
      //路由定向
      this.$router.push({name:pathName,query: {}})
    },
    //用户的积分统计
    handleUserRewardPointStat(){
      dailyStat({}).then(
        response => {
          this.urpData = response;
          if(response.totalPoints>0){
            this.urpData.es='+';
          }else if(response.totalPoints>0){
            this.urpData.es='-';
          }else{
            this.urpData.es='';
          }
        }
      );
    },
    //总的概要统计(本月)
    handleGeneralStat(){
      let nowDate = new Date();
      const para = {
        startDate:getFirstDayOfMonth(nowDate),
        endDate:getLastDayOfMonth(nowDate)
      };
      generalStat(para).then(
        response => {
          this.consumeData = response;
          let rate = getPercent(response.monthConsumeAmount+response.totalTreatAmount,response.monthBudget);
          this.consumeData.rateStr= '('+rate.toFixed(1)+'%)';
        }
      );
    },
    //用户评分
    handleUserScore(){
      const para ={
        page:1,
        pageSize:1,
        needTotal:false
      };
      fetchUserScoreList(para).then(
        response => {
          if(response.rows.length>0){
            this.score = response.rows[0].score;
          }
        }
      );
    },
    handleSetLineChartData(type) {
      this.$emit('handleSetLineChartData', type)
    }
  }
}
</script>

<style lang="scss" scoped>
.panel-group {
  margin-top: 18px;

  .card-panel-col {
    margin-bottom: 32px;
  }

  .card-panel {
    height: 108px;
    cursor: pointer;
    font-size: 12px;
    position: relative;
    overflow: hidden;
    color: #666;
    background: #fff;
    box-shadow: 4px 4px 40px rgba(0, 0, 0, .05);
    border-color: rgba(0, 0, 0, .05);

    &:hover {
      .card-panel-icon-wrapper {
        color: #fff;
      }

      .icon-people {
        background: #40c9c6;
      }

      .icon-message {
        background: #36a3f7;
      }

      .icon-money {
        background: #f4516c;
      }

      .icon-shopping {
        background: #34bfa3
      }
    }

    .icon-people {
      color: #40c9c6;
    }

    .icon-message {
      color: #36a3f7;
    }

    .icon-money {
      color: #f4516c;
    }

    .icon-shopping {
      color: #34bfa3
    }

    .card-panel-icon-wrapper {
      float: left;
      margin: 14px 0 0 14px;
      padding: 16px;
      transition: all 0.38s ease-out;
      border-radius: 6px;
    }

    .card-panel-icon {
      float: left;
      font-size: 48px;
    }

    .card-panel-description {
      float: right;
      font-weight: bold;
      margin: 26px;
      margin-left: 0px;

      .card-panel-text {
        line-height: 18px;
        color: rgba(0, 0, 0, 0.45);
        font-size: 16px;
        margin-bottom: 12px;
      }

      .card-panel-num {
        font-size: 20px;
      }
    }
  }
}

@media (max-width:550px) {
  .card-panel-description {
    display: none;
  }

  .card-panel-icon-wrapper {
    float: none !important;
    width: 100%;
    height: 100%;
    margin: 0 !important;

    .svg-icon {
      display: block;
      margin: 14px auto !important;
      float: none !important;
    }
  }
}
</style>
