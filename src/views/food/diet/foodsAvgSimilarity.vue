<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true">
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
      <el-form-item label="排序方式" prop="orderByField">
        <el-select
          v-model="queryParams.orderByField"
          placeholder="排序方式"
          collapse-tags
          size="small"
          style="width: 120px"
        >
          <el-option
            v-for="dict in orderByFieldOptions"
            :key="dict.id"
            :label="dict.text"
            :value="dict.id"
          />
        </el-select>
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
      <el-form-item label="饮食餐次" prop="dietType">
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
      <el-form-item v-if="moreCdn==true" label="地点" prop="location">
        <el-input
          v-model="queryParams.location"
          placeholder="地点"
          clearable
          size="small"
          style="width: 240px"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="stat" icon="el-icon-s-data" size="mini" @click="handleQuery" v-hasPermi="['food:diet:foodsAvgSimilarity']">统计</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
        <el-button type="primary" icon="el-icon-more" size="mini" @click="handleMoreCdn">{{cdnTitle}}</el-button>
        <el-button type="stat" icon="el-icon-s-data" size="mini" @click="handleLogStat" v-hasPermi="['food:diet:statFoodsAvgSimLog']">历史</el-button>
        <span class="link-type" @click="msgAlert('提示','值越大说明重复度越高，食物多样性越低。反之，说明食物多样性越多。')"><i class="el-icon-question" /></span>

      </el-form-item>
    </el-form>

    <!--图表数据-->
    <div>
      <simi-chart :chartData="chartData"/>
    </div>
  
  </div>
</template>

<script>
  import {getFoodsAvgSimilarity} from "@/api/food/diet";
  import SimiChart from '../../chart/simiChart'

export default {
  name: "DietFoodsAvgSimilarity",
  components: {
    'simi-chart':SimiChart
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
      //分组
      orderByFieldOptions:[
        {
          id: 'occur_time',
          text: '时间'
        },
        {
          id: 'foods',
          text: '食物'
        }
      ],
      //日期范围快速选择
      datePickerOptions:this.datePickerOptions,
      // 日期范围
      dateRange: this.getYearDateRange(0),
      // 查询参数
      queryParams: {
        orderByField:'occur_time'
      }
    };
  },
  created() {
    this.initChart();
    this.getEnumTree('FoodType','ORDINAL',false).then(response => {
      this.foodTypeOptions = response;
    });
    this.getEnumTree('DietType','ORDINAL',false).then(response => {
      this.dietTypeOptions = response;
    });
    this.getEnumTree('DietSource','ORDINAL',false).then(response => {
      this.dietSourceOptions = response;
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
    //多样性日志统计
    handleLogStat() {
      //路由定向
      this.$router.push({name:'DietStatFoodsAvgSimLog',query: {}})
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
      getFoodsAvgSimilarity(this.addDateRange(this.queryParams, this.dateRange)).then(
        response => {
          //组装chart数据
          this.chartData = {
            avg:response,
            title:'饮食重复度'
          };
          this.loading.close();
        }
      );
    }
  }
};
</script>
