<template>
  <div class="app-container">
    <el-row>
      <el-col :span="14" class="card-box">
        <el-card>
          <div class="chart-wrapper" v-loading="loading">
            <pie-chart :chartData="chartData"/>
          </div>
          <div align="center">
            <el-button type="primary" icon="el-icon-refresh" size="mini" @click="initChart()" >刷新</el-button>
          </div>
        </el-card>
      </el-col>

      <el-col :span="10" class="card-box">
        <el-card>
          <div slot="header" align="center">
            <span>统计数据&nbsp; &nbsp; </span>
            </div>
          <div class="el-table el-table--enable-row-hover el-table--medium">
            <table cellspacing="0" style="width: 100%;">
              <thead>
                <tr>
                  <th class="is-leaf"><div class="cell">字段</div></th>
                  <th class="is-leaf"><div class="cell">统计值</div></th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><div class="cell">总次数</div></td>
                  <td><div class="cell">{{ statData.totalCount }}次</div></td>
                </tr>
                <tr>
                  <td><div class="cell">总挂号费</div></td>
                  <td><div class="cell">{{ formatMoneyWithSymbal(statData.registeredFee) }}</div></td>
                </tr>
                <tr>
                  <td><div class="cell">总药费</div></td>
                  <td><div class="cell">{{ formatMoneyWithSymbal(statData.drugFee) }}</div></td>
                </tr>
                <tr>
                  <td><div class="cell">总手术费</div></td>
                  <td><div class="cell">{{ formatMoneyWithSymbal(statData.operationFee) }}</div></td>
                </tr>
                <tr>
                  <td><div class="cell">总医保支付费用</div></td>
                  <td><div class="cell">{{ formatMoneyWithSymbal(statData.medicalInsurancePaidFee) }}</div></td>
                </tr>
                <tr>
                  <td><div class="cell">总个人支付费用</div></td>
                  <td><div class="cell">{{ formatMoneyWithSymbal(statData.personalPaidFee) }}</div></td>
                </tr>
                <tr>
                  <td><div class="cell">总费用</div></td>
                  <td><div class="cell">{{ formatMoneyWithSymbal(statData.totalFee) }}</div></td>
                </tr>
              </tbody>
            </table>
          </div>
        </el-card>
      </el-col>

    </el-row>
  </div>

</template>

<script>
  import PieChart from '../../../chart/doublePieChart'

export default {
  name: "TreatRecordFullStatFeeDetail",
  components: {
    'pie-chart':PieChart
  },
  props: {
    //父层带过来的信息值
    fullStatData: {}
  },
  data() {
    return {
      chartData: {},
      // 统计数据
      statData:{},
      loading :false
    };
  },
  created() {
    this.handleReceiveData(this.fullStatData);
  },
  mounted() {
     this.handleReceiveData(this.fullStatData);
  },
  //监听父层带过来的账户信息值
  watch:{
    fullStatData: {
      deep: true,
      handler(val) {
        this.fullStatData =val;
        this.handleReceiveData(this.fullStatData);
      }
    }
  },
  methods: {
    /** 处理父类发起的数据 */
    handleReceiveData(data){
      this.statData = data;
      this.initChart();
    },
    // 打开加载层
    openLoading() {
      this.loading = this.$loading(this.loadingOptions);
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.initChart();
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.resetForm("queryForm");
      this.initChart();
    },
    initChart() {
      this.loading = true;
      let cd = {
        "title": "["+this.statData.tags+"]费用统计",
        "subTitle": "2020-01-01~2020-12-31",
        "unit" : "元",
        "xdata": ["医保支付", "个人支付", "挂号费", "药费", "手术费"],
        "detailData": [{
          "name": "医保/个人",
          "data": [{
            "name": "医保支付",
            "value": this.statData.medicalInsurancePaidFee
          }, {
            "name": "个人支付",
            "value": this.statData.personalPaidFee
          }]
        }, {
          "name": "分项费用",
          "data": [{
            "name": "挂号费",
            "value": this.statData.registeredFee
          }, {
            "name": "药费",
            "value": this.statData.drugFee
          }, {
            "name": "手术费",
            "value": this.statData.operationFee
          }]
        }]
      };
      this.chartData = Object.assign({}, this.chartData, cd);
      //重新设定高度
      this.chartData.height = '365px';
      this.loading = false;

    }
  }
};
</script>
