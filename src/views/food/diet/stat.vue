<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true">
      <el-form-item label="统计类型" prop="dateGroupType">
        <el-radio-group v-model="queryParams.dateGroupType">
          <el-radio label="YEAR">年</el-radio>
          <el-radio label="MONTH">月</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item v-if="queryParams.dateGroupType == 'YEAR'" label="选择年份">
        <el-date-picker
          v-model="queryParams.year"
          type="year"
          value-format="yyyy"
          placeholder="选择年">
        </el-date-picker>
      </el-form-item>
      <el-form-item v-if="queryParams.dateGroupType == 'MONTH'" label="选择月份">
        <el-date-picker
          v-model="queryParams.yearMonth"
          type="month"
          value-format="yyyy-MM"
          placeholder="选择月份">
        </el-date-picker>
      </el-form-item>
      <el-form-item v-if="moreCdn==true" label="食物类型" prop="foodType">
        <el-select
          v-model="queryParams.foodType"
          placeholder="食物类型"
          clearable
          size="small"
          style="width: 120px"
        >
          <el-option
            v-for="dict in foodTypeOptions"
            :key="dict.id"
            :label="dict.text"
            :value="dict.id"
          />
        </el-select>
        <el-select
          v-model="queryParams.dietSource"
          placeholder="食物来源"
          clearable
          size="small"
          style="width: 115px"
        >
          <el-option
            v-for="dict in dietSourceOptions"
            :key="dict.id"
            :label="dict.text"
            :value="dict.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="饮食餐次" prop="dietSource">
        <el-select
          v-model="queryParams.dietType"
          placeholder="餐次"
          clearable
          size="small"
          style="width: 120px"
        >
          <el-option
            v-for="dict in dietTypeOptions"
            :key="dict.id"
            :label="dict.text"
            :value="dict.id"
          />
        </el-select>

      </el-form-item>
      <el-form-item>
        <el-button type="stat" icon="el-icon-s-data" size="mini" @click="handleQuery" v-hasPermi="['food:diet:stat']">统计</el-button>
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
  import {getDietStat} from "@/api/food/diet";
  import CommonChart from '../../chart/commonChart'

export default {
  name: "Stat",
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
      // 加载层信息
      loading: [],
      //加载层配置
      loadingOptions:this.loadingOptions,
      foodTypeOptions:[],
      dietTypeOptions:[],
      dietSourceOptions:[],
      // 查询参数
      queryParams: {
        dateGroupType:'MONTH',
        yearMonth:(new Date()).Format("yyyy-MM")
      }
    };
  },
  created() {
    this.initChart();
    this.getEnumTree('FoodType','FIELD',false).then(response => {
      this.foodTypeOptions = response;
    });
    this.getEnumTree('DietType','FIELD',false).then(response => {
      this.dietTypeOptions = response;
    });
    this.getEnumTree('DietSource','FIELD',false).then(response => {
      this.dietSourceOptions = response;
    });
  },
  //监听父层带过来的账户信息值
  watch:{

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
      const dateGroupType = this.queryParams.dateGroupType;
      if(dateGroupType=='MONTH'){
        let v = this.queryParams.yearMonth;
        if(this.isObjectEmpty(v)){
          this.msgError('请选择时间');
          return;
        }
        this.queryParams.year = v.substring(0,4);
        this.queryParams.month = v.substring(5,7);
      }else{
        if(this.isObjectEmpty(this.queryParams.year)){
          this.msgError('请选择时间');
          return;
        }
        this.queryParams.month = '0';
      }
      this.openLoading();
      getDietStat(this.queryParams).then(
        response => {
          //组装chart数据
          if(this.queryParams.dateGroupType=='YEAR'){
            response.chartType='COMPARE_CALANDER';
          }else{
            response.chartType='CALANDER_PIE';
          }
          this.chartData = response;
          this.loading.close();
        }
      );
    }
  }
};
</script>
