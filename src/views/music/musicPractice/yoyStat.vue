<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true">
      <el-form-item label="选择乐器" prop="musicInstrumentId">
        <el-select
          v-model="queryParams.musicInstrumentId"
          placeholder="乐器"
          size="small"
          style="width: 240px"
          default-first-option
        >
          <el-option
            v-for="dict in musicInstrumentOptions"
            :key="dict.id"
            :label="dict.text"
            :value="dict.id"
          />
        </el-select>
      </el-form-item>
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
      <el-form-item label="统计分组" prop="groupType">
        <el-select
          v-model="queryParams.groupType"
          placeholder="统计分组"
          clearable
          size="small"
          style="width: 240px"
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
        <el-button type="stat" icon="el-icon-s-data" size="mini" @click="handleQuery" v-hasPermi="['music:musicPractice:yoyStat']">统计</el-button>
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
  import {getMusicInstrumentTree} from "@/api/music/musicInstrument";
  import {getMusicPracticeYoyStat} from "@/api/music/musicPractice";
  import {getYearTree} from "@/api/common";
  import {deepClone} from "@/utils/index";
  import CommonChart from '../../chart/commonChart'

export default {
  name: "MusicPracticeYoyStat",
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
      //乐器列表
      musicInstrumentOptions:[],
      //年份列表
      yearsOptions:[],
      //统计分类
      dateGroupTypeOptions:[],
      //分组字段
      groupTypeOptions:[
        {
          id: 'HOURS',
          text: '时长'
        },
        {
          id: 'COUNT',
          text: '次数'
        }
      ],
      //加载层配置
      loadingOptions: this.loadingOptions,
      // 查询参数
      queryParams: {
        name: undefined,
        dateGroupType:'MONTH',
        groupType:'HOURS'
      }
    };
  },
  created() {
    //加载查询条件和表单的
    this.getMusicInstrumentTreeselect();
    getYearTree(false).then(response => {
      this.yearsOptions = response;
    });
    this.getDictItemTree('CHART_YOY_DATE_GROUP',false).then(response => {
      this.dateGroupTypeOptions = response;
    });
  },
  methods: {
    /** 查询乐器下拉树结构 */
    getMusicInstrumentTreeselect() {
      getMusicInstrumentTree(false).then(response => {
        this.musicInstrumentOptions = response;
      });
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
    // 打开加载层
    openLoading() {
      this.loading = this.$loading(this.loadingOptions);
    },
    initChart() {
      //转换多选框的中挂号问题
      var acQueryParams = deepClone(this.queryParams);
      acQueryParams.years = acQueryParams.years.join(',');
      this.openLoading();
      getMusicPracticeYoyStat(acQueryParams).then(
        response => {
          //组装chart数据
          const dateGroupType = this.queryParams.dateGroupType;
          if(dateGroupType=='DAY'){
            response.chartType='CALANDER_HEAT_MAP';
          }else{
            response.chartType='LINE';
          }
          this.chartData = response;
          this.loading.close();
        }
      );
    }
  }
};
</script>
