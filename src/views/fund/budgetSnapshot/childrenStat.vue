<template>
  <el-row :gutter="40" class="panel-group">
    <el-col :xs="12" :sm="12" :lg="6" class="card-panel-col">
      <div class="card-panel">
        <div class="card-panel-icon-wrapper icon-people">
          <svg-icon icon-class="sum" class-name="card-panel-icon" />
        </div>
        <div class="card-panel-description" align="right">
          <div class="card-panel-text">
            预算总计
          </div>
          <span class="card-text">
            {{ formatMoney(statData.budgetAmount) }}
          </span>
        </div>
      </div>
    </el-col>
    <el-col :xs="12" :sm="12" :lg="6" class="card-panel-col">
      <div class="card-panel" @click="handleDispatch('UserMessage')">
        <div class="card-panel-icon-wrapper icon-message">
          <svg-icon icon-class="money" class-name="card-panel-icon" />
        </div>
        <div class="card-panel-description" align="right">
          <div class="card-panel-text">
            实际花费
          </div>
          <span class="card-text">
            {{ formatMoney(statData.cpPaidAmount) }}
          </span>
        </div>
      </div>
    </el-col>
    <el-col :xs="12" :sm="12" :lg="6" class="card-panel-col">
      <div class="card-panel" @click="handleDispatch('Budget')">
        <div class="card-panel-icon-wrapper icon-money">
          <svg-icon icon-class="calendar" class-name="card-panel-icon" />
        </div>
        <div class="card-panel-description" align="right">
          <div class="card-panel-text">
            业务日期
          </div>
          <span class="card-text">
            {{ statData.bussKey }}
          </span>
        </div>
      </div>
    </el-col>
    <el-col :xs="12" :sm="12" :lg="6" class="card-panel-col">
      <div class="card-panel" @click="handleDispatch('UserScore')">
        <div class="card-panel-icon-wrapper icon-shopping">
          <svg-icon icon-class="rate" class-name="card-panel-icon" />
        </div>
        <div class="card-panel-description" align="right">
          <div class="card-panel-text">
            花费/预算比例
          </div>
          <span class="card-text">
            {{ statData.rate.toFixed(0)+'%' }}
          </span>
        </div>
      </div>
    </el-col>
  </el-row>
</template>

<script>
  export default {
    name: "BudgetSnapshotChildrenStat",
    props: {
      statData: {
        type: Object
      }
    },
    //监听父层带过来的账户信息值
    watch: {
      statData(newVal, oldVal) {
        this.statData = newVal;
      }
    },
    data() {
      return {

      };
    },
    created() {

    },
    methods: {

    }
  }
</script>

<style lang="scss" scoped>
  .panel-group {
    margin-top: 18px;

    .card-text {
      font-weight:bold;
      font-size: 18px;
    }

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
