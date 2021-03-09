<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true">
      <el-form-item label="选择预算" prop="budgetKey">
        <treeselect v-model="queryParams.budgetId"
        :options="budgetOptions"
        :disable-branch-nodes="true"
        :show-count="true" placeholder="请选择预算"
        style="width: 240px"
        />
      </el-form-item>
      <el-form-item label="日期区间">
        <el-date-picker
          v-model="dateRange"
          size="small"
          style="width: 240px"
          value-format="yyyy-MM-dd"
          type="daterange"
          unlink-panels
          range-separator="-"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          :picker-options="datePickerOptions"
        ></el-date-picker>
      </el-form-item>
      <el-form-item>
        <el-button type="query" icon="el-icon-search" size="mini" @click="handleQuery" v-hasPermi="['fund:budgetSnapshot:history']">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <!--图表数据-->
    <div>
      <common-chart :chartData="chartData"/>
    </div>

    <el-divider></el-divider>

    <!--列表数据-->
    <el-table v-loading="loading" :data="snapshotList">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="业务日期" prop="id"  sortable="custom" align="center" width="100">
        <template slot-scope="{row}">
          <span>{{ row.bussKey }}</span>
        </template>
      </el-table-column>
      <el-table-column label="预算金额" align="center" >
        <template slot-scope="{row}">
          <span>{{ formatMoneyWithSymbal(row.amount)  }}</span>
        </template>
      </el-table-column>
      <el-table-column label="实际花费" align="center" >
        <template slot-scope="{row}">
          <span>{{ formatMoneyWithSymbal(row.cpPaidAmount)  }}</span>
          <span v-if="row.rate>100">
           <el-tag type="danger" size="mini">超支</el-tag>
          </span>
        </template>
      </el-table-column>
      <el-table-column label="花费/预算比例" align="center" >
        <template slot-scope="{row}">
          <span>
            {{row.rate.toFixed(0)+'%'}}
          </span>
        </template>
      </el-table-column>
      <el-table-column label="数据来源" align="center" >
        <template slot-scope="{row}">
          <span>{{ row.sourceName  }}</span>
        </template>
      </el-table-column>
      <el-table-column label="支付时间" min-width="180px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.cpPaidTime  }}</span>
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="total>0"
      :total="total"
      :page.sync="queryParams.page"
      :limit.sync="queryParams.pageSize"
      @pagination="getList"
    />

  </div>
</template>

<script>
  import {getPercent,progressColors} from "@/utils/mulanbay";
  import {history as getHistoryList} from "@/api/fund/budgetSnapshot";
  import {getBudgetTree} from "@/api/fund/budget";
  import {getQueryObject} from "@/utils/index";
  import CommonChart from '../../chart/commonChart'
  import Treeselect from "@riophae/vue-treeselect";
  import "@riophae/vue-treeselect/dist/vue-treeselect.css";

export default {
  name: "BudgetSnapshotHistory",
  components: {
    Treeselect,
    'common-chart':CommonChart
  },
  data() {
    return {
      // 遮罩
      loading: true,
      //统计信息
      statData:{
        budgetAmount:0,
        cpPaidAmount:0,
        bussKey:undefined,
        rate:0
      },
      snapshotList:[],
      //进度百分比颜色
      customColors: progressColors,
      // 查询参数
      queryParams: {
        page: 1,
        pageSize: 10,
        budgetId:undefined,
        needChart:true
      },
      // 总条数
      total: 0,
      //图表数据
      chartData:{},
      //预算列表
      budgetOptions:[],
      //日期范围快速选择
      datePickerOptions:this.datePickerOptions,
      // 日期范围
      dateRange: []
    };
  },
  created() {
    let qb = getQueryObject(null);
    this.queryParams.budgetId = qb.budgetId;
    this.getBudgetTreeselect();
    this.getList();
  },
  methods: {
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.page = 1;
      this.getList();
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.resetForm("queryForm");
      this.handleQuery();
    },
    /** 查询预算下拉树结构 */
    getBudgetTreeselect() {
      getBudgetTree(false).then(response => {
        this.budgetOptions = response;
      });
    },
    /** 预算快照列表 */
    getList(){
      this.loading = true;
      getHistoryList(this.addDateRange(this.queryParams, this.dateRange)).then(
        response => {
          this.loading = false;
          this.snapshotList = response.beanList;
          this.total = response.maxRow;
          this.chartData = response.chartData;
          this.chartData.height='350px';
          this.chartData.chartType='MIX_LINE_BAR';
        }
      );
    }
  }
};
</script>
