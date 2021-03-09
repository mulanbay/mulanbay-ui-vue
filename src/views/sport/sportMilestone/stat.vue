<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true">
      <el-form-item label="选择运动" prop="sportTypeId">
        <el-select
          v-model="queryParams.sportTypeId"
          placeholder="运动"
          clearable
          size="small"
          style="width: 240px"
          @change="handleQuery"
        >
          <el-option
            v-for="dict in sportTypeOptions"
            :key="dict.id"
            :label="dict.text"
            :value="dict.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">统计</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <!--图表数据-->
    <div>
      <common-chart :chartData="chartData"/>
    </div>

  </div>
</template>

<script>
  import {getSportTypeTree} from "@/api/sport/sportType";
  import {getSportMilestoneStat} from "@/api/sport/sportMilestone";
  import CommonChart from '../../chart/commonChart'

export default {
  name: "SportMilestoneStat",
  components: {
    'common-chart':CommonChart
  },
  props: {
    //父层带过来的账户信息值
    queryAccountData: {
      id: '',
    }
  },
  mounted() {
     //this.initChart();
  },
  data() {
    return {
      //图表数据
      chartData:{},
      // 加载层信息
      loading: [],
      //加载层配置
      loadingOptions:this.loadingOptions,
      //运动类型
      sportTypeOptions:[],
      // 查询参数
      queryParams: {
        sportTypeId:undefined
      }
    };
  },
  created() {
    //查询运动类型
    this.getSportTypeTreeselect();
    this.initChart();
  },
  //监听父层带过来的账户信息值
  watch:{
    queryAccountData(newVal,oldVal){
      this.queryParams.accountId=newVal.id+'';
      this.initChart();
    }
  },
  methods: {
    /** 查询运动类型下拉树结构 */
    getSportTypeTreeselect() {
      getSportTypeTree(false).then(response => {
        this.sportTypeOptions = response;
      });
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
      this.openLoading();
      getSportMilestoneStat(this.queryParams).then(
        response => {
          //组装chart数据
          response.chartType='LINE';
          this.chartData = response;
          this.loading.close();
        }
      );
    }
  }
};
</script>
