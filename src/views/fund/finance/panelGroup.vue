<template>
  <el-row :gutter="40" class="panel-group">
    <el-col :xs="12" :sm="12" :lg="6" class="card-panel-col">
      <div class="card-panel" @click="handleDispatch('BuyRecord')">
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
      <div class="card-panel" @click="handleDispatch('Budget')">
        <div class="card-panel-icon-wrapper icon-people">
          <svg-icon icon-class="budget" class-name="card-panel-icon" />
        </div>
        <div class="card-panel-description" align="right">
          <div class="card-panel-text">
            今年预算
          </div>
          <span style="font-weight:bold;font-size: 18px;">￥{{consumeData.yearBudget}}</span>
        </div>
      </div>
    </el-col>
    <el-col :xs="12" :sm="12" :lg="6" class="card-panel-col">
      <div class="card-panel" @click="handleDispatch('Income')">
        <div class="card-panel-icon-wrapper icon-message">
          <svg-icon icon-class="income" class-name="card-panel-icon" />
        </div>
        <div class="card-panel-description">
          <div class="card-panel-text">
            本月收入
          </div>
          <span style="font-weight:bold;font-size: 18px;">￥</span>
          <count-to :start-val="0" :end-val="consumeData.totalIncome" :duration="3000" class="card-panel-num" />
        </div>
      </div>
    </el-col>
    <el-col :xs="12" :sm="12" :lg="6" class="card-panel-col">
      <div class="card-panel" @click="handleDispatch('UserScore')">
        <div class="card-panel-icon-wrapper icon-shopping">
          <svg-icon icon-class="history" class-name="card-panel-icon" />
        </div>
        <div class="card-panel-description" align="right">
          <div class="card-panel-text">
            本月过去
          </div>
          <count-to :start-val="0" :end-val="consumeData.monthPassDays" :duration="3600" class="card-panel-num" />
          天
        </div>
      </div>
    </el-col>
  </el-row>
</template>

<script>
  import {generalStat} from "@/api/main";
  import {getFirstDayOfMonth,getLastDayOfMonth} from "@/utils/datetime";
  import {getPercent} from "@/utils/mulanbay";
  import CountTo from 'vue-count-to'

export default {
  name: "FundPanelGroup",
  components: {
    CountTo
  },
  data() {
    return {
      //本月统计
      consumeData:{
        monthBudget:0,
        monthConsumeAmount:0,
        totalTreatAmount:0
      }
    };
  },
  created() {
    this.handleGeneralStat();
  },
  methods: {
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
      color: #424264
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
