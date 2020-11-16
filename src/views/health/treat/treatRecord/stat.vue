<template>
  <div class="app-container">
    <el-row>
      <el-col :span="24" class="card-box">
          <div>
            <el-form :model="queryParams" ref="queryForm" :inline="true">
              <el-form-item label="看病日期">
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
              <el-form-item label="看病类型" prop="treatType">
                <el-select
                  v-model="queryParams.treatType"
                  placeholder="看病类型"
                  clearable
                  size="small"
                  style="width: 120px"
                >
                  <el-option
                    v-for="dict in treatTypeOptions"
                    :key="dict.id"
                    :label="dict.text"
                    :value="dict.id"
                  />
                </el-select>
              </el-form-item>
              <el-form-item>
                <el-button type="stat" icon="el-icon-s-data" size="mini" @click="handleQuery" v-hasPermi="['health:treat:treatRecord:stat']">统计</el-button>
                <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
              </el-form-item>
            </el-form>
          </div>
      </el-col>

      <el-col :span="14" class="card-box">
        <el-card>
          <div class="chart-wrapper">
            <pie-chart :chartData="chartData"/>
          </div>
        </el-card>
      </el-col>

      <el-col :span="10" class="card-box">
        <el-card>
          <div slot="header" align="center"><span>统计数据</span></div>
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
                  <td><div class="cell">{{ formatMoneyWithSymbal(statData.totalRegisteredFee) }}</div></td>
                </tr>
                <tr>
                  <td><div class="cell">总药费</div></td>
                  <td><div class="cell">{{ formatMoneyWithSymbal(statData.totalDrugFee) }}</div></td>
                </tr>
                <tr>
                  <td><div class="cell">总手术费</div></td>
                  <td><div class="cell">{{ formatMoneyWithSymbal(statData.totalOperationFee) }}</div></td>
                </tr>
                <tr>
                  <td><div class="cell">总医保支付费用</div></td>
                  <td><div class="cell">{{ formatMoneyWithSymbal(statData.totalMedicalInsurancePaidFee) }}</div></td>
                </tr>
                <tr>
                  <td><div class="cell">总个人支付费用</div></td>
                  <td><div class="cell">{{ formatMoneyWithSymbal(statData.totalPersonalPaidFee) }}</div></td>
                </tr>
                <tr>
                  <td><div class="cell">总费用</div></td>
                  <td><div class="cell">{{ formatMoneyWithSymbal(statData.totalTotalFee) }}</div></td>
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
  import {getTreatRecordStat} from "@/api/health/treat/treatRecord";
  import PieChart from '../../../chart/doublePieChart'

export default {
  name: "Stat",
  components: {
    'pie-chart':PieChart
  },
  data() {
    return {
      // 加载层信息
      loading: [],
      //加载层配置
      loadingOptions:this.loadingOptions,
      chartData: {},
      //日期范围快速选择
      datePickerOptions:this.datePickerOptions,
      // 日期范围
      dateRange: this.getYearDateRange(0),
      //看病类型
      treatTypeOptions:[],
      // 统计数据
      statData:{},
      // 查询参数
      queryParams: {

      }
    };
  },
  created() {
    this.initChart();
    this.getEnumTree('TreatType','FIELD',false).then(response => {
      this.treatTypeOptions = response;
    });
  },
  methods: {
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
      this.openLoading();
      getTreatRecordStat(this.addDateRange(this.queryParams, this.dateRange)).then(
        response => {
          this.chartData = response.pieData;
          //重新设定高度
          this.chartData.height = '395px';
          this.statData = response;
          this.loading.close();
        }
      );
    }
  }
};
</script>
