<template>
  <div class="app-container">
    <el-row>
      <el-col :span="24" class="card-box">
          <div>
            <el-form :model="queryParams" ref="queryForm" :inline="true">
              <el-form-item label="选取计划" prop="userPlanId">
               <treeselect
                v-model="queryParams.userPlanId"
                @input="handleQuery"
                style="width: 400px"
                :options="userPlanOptions"
                :disable-branch-nodes="true"
                :show-count="true"
                :searchable="true"
                placeholder="请选择"
                />
              </el-form-item>
              <el-form-item label="报告日期">
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
                <el-button type="stat" icon="el-icon-s-data" size="mini" @click="handleQuery" v-hasPermi="['report:plan:planReport:stat']">统计</el-button>
                <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
              </el-form-item>
            </el-form>
          </div>
      </el-col>

      <el-col :span="12" class="card-box">
        <el-card>
          <div class="chart-wrapper">
            <pie-chart :chartData="planReportChartData"/>
          </div>
        </el-card>
      </el-col>

      <el-col :span="12" class="card-box">
        <el-card>
          <div slot="header"><span>统计值</span></div>
          <div class="el-table el-table--enable-row-hover el-table--medium">
            <table cellspacing="0" style="width: 100%;">
              <thead>
                <tr>
                  <th class="is-leaf"><div class="cell">名称</div></th>
                  <th class="is-leaf"><div class="cell">统计值</div></th>
                  <th class="is-leaf"><div class="cell">计划期望值</div></th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><div class="cell">总次数</div></td>
                  <td><div class="cell">{{ statData.reportCountValueSum }}{{countUnit}}</div></td>
                  <td><div class="cell">{{ statData.planCountValueExpectSum }}{{countUnit}}</div></td>
                </tr>
                <tr>
                  <td><div class="cell">总值</div></td>
                  <td><div class="cell">{{ statData.reportValueSum }}{{valueUnit}}</div></td>
                  <td><div class="cell">{{ statData.planValueExpectSum }}{{valueUnit}}</div></td>
                </tr>
                <tr>
                  <td><div class="cell">次数的平均值</div></td>
                  <td><div class="cell">{{ statData.averageReportCountValue }}{{countUnit}}</div></td>
                  <td><div class="cell">{{ statData.planCountValue }}{{countUnit}}</div></td>
                </tr>
                <tr>
                  <td><div class="cell">值的平均值</div></td>
                  <td><div class="cell">{{ statData.averageReportValue }}{{valueUnit}}</div></td>
                  <td><div class="cell">{{ statData.planValue }}{{valueUnit}}</div></td>
                </tr>
                <tr>
                  <td><div class="cell">值/次的平均值</div></td>
                  <td><div class="cell">{{ statData.averageValue }}{{valueUnit}}</div></td>
                  <td><div class="cell" style="color: red;">平均每次计划相差</div></td>
                </tr>
                <tr>
                  <td><div class="cell">总次数相差</div></td>
                  <td><div class="cell">{{ statData.diffCountValueSum }}{{countUnit}}</div></td>
                  <td><div class="cell">{{ statData.avgDiffCountValue }}{{countUnit}}</div></td>
                </tr>
                <tr>
                  <td><div class="cell">总值相差</div></td>
                  <td><div class="cell">{{ statData.diffValueSum }}{{valueUnit}}</div></td>
                  <td><div class="cell">{{ statData.avgDiffValue }}{{valueUnit}}</div></td>
                </tr>
              </tbody>
            </table>
          </div>
        </el-card>
      </el-col>

      <el-col :span="24" class="card-box">
        <el-card>
          <div slot="header">
            <span>统计信息</span>
          </div>
          <div class="el-table el-table--enable-row-hover el-table--medium">
            <table cellspacing="0" style="width: 100%;">
              <tbody>
                <tr>
                  <td><div class="cell">当前数据总条数</div></td>
                  <td><div class="cell">{{ statData.totalCount }}</div></td>
                  <td><div class="cell">计划期望值参考年份</div></td>
                  <td><div class="cell">{{ statData.year }}</div></td>
                </tr>
                <tr>
                  <td><div class="cell">计划期望值单位</div></td>
                  <td><div class="cell">{{ statData.unit }}</div></td>
                  <td><div class="cell">说明</div></td>
                  <td><div class="cell" style="color: red;">相差值:正数表示正常(高于预期)，负数表示异常(低于预期)</div></td>
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
  import {getPlanReportStat} from "@/api/report/plan/planReport";
  import {getUserPlanTree} from "@/api/report/plan/userPlan";

  import Treeselect from "@riophae/vue-treeselect";
  import "@riophae/vue-treeselect/dist/vue-treeselect.css";

  import PieChart from '../../../chart/doublePieChart'

export default {
  name: "PlanReportStat",
  components: {
    Treeselect,
    'pie-chart':PieChart
  },
  data() {
    return {
      countUnit:'',
      valueUnit:'',
      // 加载层信息
      loading: [],
      loadingOptions:this.loadingOptions,
      // 服务器信息
      server: [],
      //日期范围快速选择
      datePickerOptions:this.datePickerOptions,
      // 日期范围
      dateRange: [],
      userPlanOptions: [],
      queryParams:{},
      planReportChartData:{},
      statData:{}
    };
  },
  created() {
    this.getUserPlanOptionsTreeselect();
    this.getList();
  },
  methods: {
    /** 查询搜索条件中的模板下拉树结构 */
    getUserPlanOptionsTreeselect() {
      getUserPlanTree(false,null,null).then(response => {
        this.userPlanOptions = response;
      });
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
    /** 查询服务器信息 */
    getList() {
      this.openLoading();
      //this.addDateRange(this.form, this.dateRange)
      getPlanReportStat(this.addDateRange(this.queryParams, this.dateRange)).then(
        response => {
          this.planReportChartData = response.pieData;
          //重新设定高度
          this.planReportChartData.height = '395px';
          let data = response;
          if(data.userPlanConfigValue){
            this.countUnit='次';
            this.valueUnit=data.userPlanConfigValue.userPlan.unit;
            this.statData={
              year: data.userPlanConfigValue.year,
              totalCount: data.totalCount,
              unit: data.userPlanConfigValue.userPlan.unit,
              reportCountValueSum: data.reportCountValueSum,
              reportValueSum: data.reportValueSum,
              planCountValueExpectSum : data.userPlanConfigValue.planCountValue*data.totalCount,
              planValueExpectSum : data.userPlanConfigValue.planValue*data.totalCount,
              averageReportCountValue :((data.reportCountValueSum+0.0)/data.totalCount).toFixed(1),
              averageReportValue :((data.reportValueSum+0.0)/data.totalCount).toFixed(1),
              averageValue :((data.reportValueSum+0.0)/data.reportCountValueSum).toFixed(2),
              planCountValue : data.userPlanConfigValue.planCountValue,
              planValue : data.userPlanConfigValue.planValue,
              diffCountValueSum: data.diffCountValueSum,
              diffValueSum: data.diffValueSum,
              avgDiffCountValue :((data.diffCountValueSum+0.0)/data.totalCount).toFixed(1),
              avgDiffValue: ((data.diffValueSum+0.0)/data.totalCount).toFixed(1)
            };
          }else{
            this.statData={};
            this.countUnit='';
            this.valueUnit='';
          }
          this.loading.close();
        }
      );
    },
    // 打开加载层
    openLoading() {
      this.loading = this.$loading(this.loadingOptions);
    }
  }
};
</script>
<style lang="scss" scoped>
@media (max-width:1024px) {
  .chart-wrapper {
    padding: 8px;
  }
}
</style>
