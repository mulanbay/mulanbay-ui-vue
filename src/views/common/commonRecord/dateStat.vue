<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true">
      <el-form-item label="选择类型" prop="commonRecordTypeId">
        <el-select
          v-model="queryParams.commonRecordTypeId"
          placeholder="类型"
          clearable
          size="small"
          style="width: 240px"
        >
          <el-option
            v-for="dict in commonRecordTypeOptions"
            :key="dict.id"
            :label="dict.text"
            :value="dict.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="起止日期">
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
      <el-form-item label="统计分类" prop="dateGroupType">
        <el-select
          v-model="queryParams.dateGroupType"
          placeholder="统计分类"
          clearable
          size="small"
          style="width: 120px"
        >
          <el-option
            v-for="dict in dateGroupTypeOptions"
            :key="dict.id"
            :label="dict.text"
            :value="dict.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item v-if="moreCdn==true" label="名称检索" prop="name">
        <el-input
          v-model="queryParams.name"
          placeholder="请输入名称"
          clearable
          size="small"
          style="width: 240px"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item v-if="moreCdn==true" label="补全日期" prop="compliteDate">
        <el-switch v-model="queryParams.compliteDate" ></el-switch>
      </el-form-item>
      <el-form-item>
        <el-button type="stat" icon="el-icon-s-data" size="mini" @click="handleQuery" v-hasPermi="['common:commonRecord:dateStat']">统计</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
        <el-button type="primary" icon="el-icon-more" size="mini" @click="handleMoreCdn">{{cdnTitle}}</el-button>
      </el-form-item>
    </el-form>

    <!--图表数据-->
    <div>
      <common-chart :chartData="chartData"/>
    </div>

  </div>
</template>

<script>
  import {getCommonRecordTypeTree } from "@/api/common/commonRecordType";
  import {getCommonRecordDateStat} from "@/api/common/commonRecord";
  import CommonChart from '../../chart/commonChart'

export default {
  name: "DateStat",
  components: {
    'common-chart':CommonChart
  },
  mounted() {
     //this.initChart();
  },
  data() {
    return {
      //查询条件更多属性 start
      cdnTitle:'更多',
      moreCdn:false,
      //查询条件更多属性 end
      //图表数据
      chartData:{},
      //类型
      commonRecordTypeOptions:[],
      //加载层配置
      loadingOptions: this.loadingOptions,
      //统计分类
      dateGroupTypeOptions:[],
      //日期范围快速选择
      datePickerOptions:this.datePickerOptions,
      // 日期范围
      dateRange: this.getYearDateRange(0),
      // 查询参数
      queryParams: {
        dateGroupType:'MONTH',
        compliteDate:true,
        fullStat:false
      }
    };
  },
  created() {
    //加载查询条件和表单的
    this.getCommonRecordTypeTreeselect();
    this.getDictItemTree('CHART_DATE_GROUP',false).then(response => {
      this.dateGroupTypeOptions = response;
    });
    //this.initChart();
  },
  methods: {
    /** 更多查询条件处理 */
    handleMoreCdn(){
      if(this.moreCdn==true){
        //this.resetForm("queryForm");
        this.moreCdn=false;
        this.cdnTitle='更多';
      }else{
        this.moreCdn=true;
        this.cdnTitle='取消';
      }
    },
    /** 查询类型下拉树结构 */
    getCommonRecordTypeTreeselect() {
      getCommonRecordTypeTree(false).then(response => {
        this.commonRecordTypeOptions = response;
      });
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
    // 打开加载层
    openLoading() {
      this.loading = this.$loading(this.loadingOptions);
    },
    initChart() {
      this.openLoading();
      getCommonRecordDateStat(this.addDateRange(this.queryParams, this.dateRange)).then(
        response => {
          //组装chart数据
          const dateGroupType = this.queryParams.dateGroupType;
          switch (this.queryParams.dateGroupType) {
            case 'DAYCALENDAR':
              //日历图
              response.chartType = 'CALANDER';
              break;
            case 'HOURMINUTE':
            //散点图
              response.chartType = 'SCATTER';
              break;
            default:
              response.chartType='MIX_LINE_BAR';
          }
          this.chartData = response;
          this.loading.close();
        }
      );
    }
  }
};
</script>
