<template>
  <div class="app-container">
    <panel-group />

    <el-row>
      <el-col :span="12" class="card-box">
        <el-card>
          <div class="chart-wrapper">
            <pie-chart ref="chart" :chartData="chartData"/>
          </div>
          <div align="center">
            <el-button type="stat" icon="el-icon-s-data" size="mini" @click="consumeChartStat" >消费分析</el-button>
            <el-button type="stat" icon="el-icon-s-data" size="mini" @click="incomeChartStat" >收入分析</el-button>
          </div>
        </el-card>
      </el-col>

      <el-col :span="12" class="card-box">
        <el-card>
          <div class="chart-wrapper">
            <pie-chart ref="chart" :chartData="accountChartData"/>
          </div>
        </el-card>
      </el-col>

    </el-row>

    <el-divider content-position="center">
      <svg-icon icon-class="budget" class-name="card-panel-icon" />
      预算列表
    </el-divider>

    <!--预算列表数据-->
    <el-table v-loading="loading" :data="budgetList">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="ID" prop="id" sortable="custom" align="center" width="80">
        <template slot-scope="{row}">
          <span>{{ row.id }}</span>
        </template>
      </el-table-column>
      <el-table-column label="名称" min-width="180px" :show-overflow-tooltip="true">
        <template slot-scope="{row}">
          <span>{{ row.name }}</span>
        </template>
      </el-table-column>
      <el-table-column label="预算金额" align="center" width="150">
        <template slot-scope="{row}">
          <span>{{ formatMoney(row.amount) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="周期类型" align="center" width="95">
        <template slot-scope="{row}">
          <span>{{ row.periodName }}</span>
        </template>
      </el-table-column>
      <el-table-column label="本期支付时间" :show-overflow-tooltip="true" align="center" width="150">
        <template slot-scope="{row}">
          <span>{{ formatCurrentPaidTime(row) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="本期支付金额" :show-overflow-tooltip="true" align="center" width="150">
        <template slot-scope="{row}">
          <span>{{ formatCurrentPaidAmount(row) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="进度" align="center" width="80">
        <template slot-scope="{row}">
          <span v-if="row.cpPaidAmount!=null">
            <el-progress :percentage="formatPercent(row)" :color="customColors"></el-progress>
          </span>
        </template>
      </el-table-column>
      <el-table-column label="历史" align="center">
        <template slot-scope="{row}">
          <span class="link-type" @click="showHistory(row)" v-hasPermi="['fund:budgetSnapshot:history']">
           <i class="el-icon-menu" />
          </span>
        </template>
      </el-table-column>
      <el-table-column label="类型" align="center">
        <template slot-scope="{row}">
          <span>{{ row.typeName }}</span>
        </template>
      </el-table-column>
      <el-table-column label="标签" align="center" width="95">
        <template slot-scope="{row}">
          <span v-if="row.keywords != null">
           <el-tag type="success">{{ row.keywords}}</el-tag>
          </span>
        </template>
      </el-table-column>
      <el-table-column label="状态" align="center" width="100">
        <template slot-scope="{row}">
          <el-switch v-model="row.status" active-value="ENABLE" inactive-value="DISABLE" disabled></el-switch>
        </template>
      </el-table-column>
    </el-table>

  </div>
</template>

<script>
  import {generalStat } from "@/api/main";
  import {statWithTreat} from "@/api/consume/buyRecord";
  import {getIncomeStat} from "@/api/fund/income";
  import {getAccountStat} from "@/api/fund/account";
  import {fetchList as getBudgetList} from "@/api/fund/budget";

  import {getPercent,progressColors} from "@/utils/mulanbay";
  import PieChart from '../../chart/pieChart';
  import resize from '../../dashboard/mixins/resize.js'
  import PanelGroup from './panelGroup'

export default {
  name: "Main",
  mixins: [resize],
  components: {
    'pie-chart':PieChart,
    PanelGroup,
  },
  data() {
    return {
      // 加载层信息
      loading: false,
      loadingOptions:this.loadingOptions,
      // 日期范围
      dateRange: this.getMonthDateRange(new Date()),
      queryParams:{},
      //消费/收入统计图表
      chartData:{},
      //账户统计图表
      accountChartData:{},
      //进度百分比颜色
      customColors: progressColors,
      //预算列表
      budgetList:[]
    };
  },
  created() {
    this.getList();
  },
  methods: {
    //跳转
    handleDispatch(pathName){
      //路由定向
      this.$router.push({name:pathName,query: {}})
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.getList();
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.resetForm("queryForm");
      this.handleQuery();
    },
    /** 参数 */
    getPara(){
      return this.addDateRange(this.queryParams, this.dateRange);
    },
    /** 查询服务器信息 */
    getList() {
      let para = this.getPara();
      this.consumeChartStat();
      this.accountChartStat();
      this.loadBudgetList();
    },
    // 消费图表统计
    consumeChartStat(){
      let para = this.getPara();
      statWithTreat(para).then(
        response => {
          //组装chart数据
          response.height = '500px';
          this.chartData = response;
        }
      );
    },
    // 收入图表统计
    incomeChartStat(){
      let para = this.getPara();
      getIncomeStat(para).then(
        response => {
          //组装chart数据
          response.chartType='PIE';
          response.height = '500px';
          this.chartData = response;
        }
      );
    },
    // 账户图表统计
    accountChartStat() {
      const para={
        groupType: "NAME"
      };
      getAccountStat(para).then(
        response => {
          //组装chart数据
          response.chartType='PIE';
          response.height = '525px';
          this.accountChartData = response;
        }
      );
    },
    // 预算列表
    loadBudgetList(){
      const para ={
        page:0,
        status:'ENABLE'
      };
      getBudgetList(para).then(
        response => {
          this.budgetList = response.rows;
          //this.loading = false;
        }
      );
    },
    /** 本期支付时间 */
    formatCurrentPaidTime(row){
      if(row.cpPaidTime){
        return row.cpPaidTime.substr(5,5)+'(已支付)';
      }else{
        if(row.nextPaytime){
          let cpt = row.nextPaytime.substr(5,5);
          if(row.leftDays==0){
            return cpt+'(今天)';
          }else if(row.leftDays<0){
            var ld = 0-row.leftDays;
            return cpt+'(已过去'+ld+'天)';
          }else{
            var ld = row.leftDays;
            return cpt+'('+ld+'天后)';
          }
        }else{
          return '--';
        }
      }
    },
    /** 本期支付金额 */
    formatCurrentPaidAmount(row){
      if(row.cpPaidAmount){
        var ca = (row.cpPaidAmount-row.amount).toFixed(2);
        if(ca>0){
          return this.formatMoney(row.cpPaidAmount)+'(+'+ca+')';
        }else if(ca<0){
          return this.formatMoney(row.cpPaidAmount)+'(-'+(0-ca)+')';
        }else{
          return this.formatMoney(row.cpPaidAmount);
        }
      }else{
        return '--';
      }
    },
    /** 进度 */
    formatPercent(row){
      let pp = getPercent(row.cpPaidAmount,row.amount);
      return parseInt(pp.toFixed(0));
    },
    // 打开加载层
    openLoading() {
      this.loading = this.$loading(this.loadingOptions);
    }
  }
};
</script>
