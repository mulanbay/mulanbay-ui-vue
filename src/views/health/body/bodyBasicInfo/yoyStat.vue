<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true">
      <el-form-item label="年份选择" prop="years">
        <el-select
          v-model="queryParams.years"
          placeholder="年份选择"
          clearable
          multiple
          collapse-tags
          size="small"
          style="width: 240px"
        >
          <el-option
            v-for="dict in yearsOptions"
            :key="dict.id"
            :label="dict.text"
            :value="dict.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="统计分类" prop="dateGroupType">
        <el-select
          v-model="queryParams.dateGroupType"
          placeholder="统计分类"
          clearable
          size="small"
          style="width: 240px"
        >
          <el-option
            v-for="dict in dateGroupTypeOptions"
            :key="dict.id"
            :label="dict.text"
            :value="dict.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="统计分类" prop="groupField">
        <el-select
          v-model="queryParams.groupType"
          placeholder="字段类型"
          clearable
          size="small"
          style="width: 100px"
        >
          <el-option
            v-for="dict in groupTypeOptions"
            :key="dict.id"
            :label="dict.text"
            :value="dict.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="stat" icon="el-icon-s-data" size="mini" @click="handleQuery" v-hasPermi="['sport:sportExercise:yoyStat']">统计</el-button>
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
  import {getBodyBasicInfoYoyStat} from "@/api/health/body/bodyBasicInfo";
  import {getYearTree} from "@/api/common";
  import {deepClone} from "@/utils/index";
  import CommonChart from '../../../chart/commonChart'

export default {
  name: "BodyBasicInfoYoyStat",
  components: {
    'common-chart':CommonChart
  },
  mounted() {
     //this.initChart();
  },
  data() {
    return {
      //图表数据
      chartData:{},
      //年份列表
      yearsOptions:[],
      //统计分类
      dateGroupTypeOptions:[],
      groupTypeOptions:[],
      // 查询参数
      queryParams: {
        name: undefined,
        dateGroupType:'MONTH',
        groupType:'WEIGHT'
      }
    };
  },
  created() {
    //加载查询条件和表单的
    getYearTree(false).then(response => {
      this.yearsOptions = response;
    });
    this.getDictItemTree('CHART_YOY_DATE_GROUP',false).then(response => {
      this.dateGroupTypeOptions = response;
    });
    this.getDictItemTree('BBI_YOY_STAT_GROUP_TYPE',false).then(response => {
      this.groupTypeOptions = response;
    });
  },
  methods: {
    /** 搜索按钮操作 */
    handleQuery() {
      this.initChart();
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.resetForm("queryForm");
      //this.initChart();
    },
    initChart() {
      //转换多选框的中挂号问题
      var acQueryParams = deepClone(this.queryParams);
      acQueryParams.years = acQueryParams.years.join(',');
      //alert(JSON.stringify(acQueryParams));
      getBodyBasicInfoYoyStat(acQueryParams).then(
        response => {
          //组装chart数据
          const dateGroupType = this.queryParams.dateGroupType;
          if(dateGroupType=='DAY'){
            response.chartType='CALANDER_HEAT_MAP';
          }else{
            response.chartType='LINE';
          }
          this.chartData = response;
        }
      );
    }
  }
};
</script>
