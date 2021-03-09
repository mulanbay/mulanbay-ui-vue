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
      <el-form-item label="统计分组" prop="dateGroupType">
        <el-select
          v-model="queryParams.dateGroupType"
          placeholder="统计分组"
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
      <el-form-item label="统计分类" prop="groupType">
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
        <el-select
          v-model="queryParams.feeField"
          placeholder="统计字段"
          clearable
          size="small"
          style="width: 150px"
        >
          <el-option
            v-for="dict in feeFieldOptions"
            :key="dict.id"
            :label="dict.text"
            :value="dict.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item v-if="moreCdn==true" label="名称查询" prop="name">
        <el-input
          v-model="queryParams.name"
          placeholder="请输入名称"
          clearable
          size="small"
          style="width: 240px"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item v-if="moreCdn==true" label="看病类型" prop="treatType">
        <el-select
          v-model="queryParams.treatType"
          placeholder=""
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
        <el-button type="stat" icon="el-icon-s-data" size="mini" @click="handleQuery" v-hasPermi="['sport:sportExercise:yoyStat']">统计</el-button>
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
  import {getTreatCategoryTree,getTreatRecordYoyStat} from "@/api/health/treat/treatRecord";
  import {getYearTree} from "@/api/common";
  import {deepClone} from "@/utils/index";
  import CommonChart from '../../../chart/commonChart'

export default {
  name: "TreatRecordYoyStat",
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
      //年份列表
      yearsOptions:[],
      //统计分类
      dateGroupTypeOptions:[],
      //统计分类
      feeFieldOptions:[],
      groupTypeOptions:[],
      treatTypeOptions:[],
      // 查询参数
      queryParams: {
        name: undefined,
        dateGroupType:'MONTH',
        groupType:'COUNT',
        feeField:'total_fee'
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
    this.getDictItemTree('TREAT_DATE_STAT_FIELD',false).then(response => {
      this.feeFieldOptions = response;
    });
    this.getDictItemTree('TREAT_ANALYSE_GROUP_TYPE',false).then(response => {
      this.groupTypeOptions = response;
    });
    this.getEnumTree('TreatType','ORDINAL',false).then(response => {
      this.treatTypeOptions = response;
    });
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
      let acQueryParams = deepClone(this.queryParams);
      acQueryParams.years = acQueryParams.years.join(',');
      //alert(JSON.stringify(acQueryParams));
      getTreatRecordYoyStat(acQueryParams).then(
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
