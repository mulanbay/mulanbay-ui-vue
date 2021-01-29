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
          style="width: 120px"
        >
          <el-option
            v-for="dict in dateGroupTypeOptions"
            :key="dict.id"
            :label="dict.text"
            :value="dict.id"
          />
        </el-select>
        <el-select
          v-model="queryParams.groupType"
          placeholder="字段"
          size="small"
          style="width: 115px"
        >
          <el-option
            v-for="dict in groupTypeOptions"
            :key="dict.id"
            :label="dict.text"
            :value="dict.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item v-if="moreCdn==true" label="商品类型" prop="goodsType">
        <el-select
          v-model="queryParams.goodsType"
          placeholder="商品类型"
          clearable
          size="small"
          style="width: 240px"
          @change="getSubGoodsTypeTreeselect"
        >
          <el-option
            v-for="dict in goodsTypeOptions"
            :key="dict.id"
            :label="dict.text"
            :value="dict.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item v-if="moreCdn==true" label="商品子类" clearable  prop="subGoodsType">
        <el-select
          v-model="queryParams.subGoodsType"
          placeholder="商品子类"
          clearable
          size="small"
          style="width: 240px"
        >
          <el-option
            v-for="dict in subGoodsTypeOptions"
            :key="dict.id"
            :label="dict.text"
            :value="dict.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item v-if="moreCdn==true" label="购买来源" prop="buyType">
        <el-select
          v-model="queryParams.buyType"
          placeholder="购买来源"
          clearable
          size="small"
          style="width: 240px"
        >
          <el-option
            v-for="dict in buyTypeOptions"
            :key="dict.id"
            :label="dict.text"
            :value="dict.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item v-if="moreCdn==true" label="消费类型" prop="consumeType">
        <el-select
          v-model="queryParams.consumeType"
          placeholder="方式"
          clearable
          size="small"
          style="width: 120px"
        >
          <el-option
            v-for="dict in consumeTypeOptions"
            :key="dict.id"
            :label="dict.text"
            :value="dict.id"
          />
        </el-select>
        <el-select
          v-model="queryParams.secondhand"
          placeholder="二手"
          clearable
          size="small"
          style="width: 115px"
        >
          <el-option
            v-for="dict in secondhandOptions"
            :key="dict.id"
            :label="dict.text"
            :value="dict.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item v-if="moreCdn==true" label="价格区间">
          <el-input-number v-model="queryParams.startTotalPrice" clearable :min="0" label="最低价格" style="width: 120px"></el-input-number>
          <el-input-number v-model="queryParams.endTotalPrice" clearable :min="0" label="最高价格" style="width: 120px"></el-input-number>
      </el-form-item>
      <el-form-item>
        <el-button type="stat" icon="el-icon-s-data" size="mini" @click="handleQuery" v-hasPermi="['consume:buyRecord:yoyStat']">统计</el-button>
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
  import {fetchList,getBuyRecordYoyStat} from "@/api/consume/buyRecord";
  import {getGoodsTypeTree} from "@/api/consume/goodsType";
  import {getBuyTypeTree} from "@/api/consume/buyType";
  import {getYearTree} from "@/api/common";
  import {deepClone} from "@/utils/index";
  import CommonChart from '../../chart/commonChart'

export default {
  name: "YoyStat",
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
      // 总条数
      buyRecordList:[],
      //商品类型(搜索和表单是同一个)
      goodsTypeOptions:[],
      //搜索条件的商品子类型
      subGoodsTypeOptions:[],
      //购买来源(搜索和表单是同一个)
      buyTypeOptions:[],
      //消费类型
      consumeTypeOptions:[],
      //年份列表
      yearsOptions:[],
      //统计分类
      dateGroupTypeOptions:[],
      secondhandOptions:this.booleanOptions,
      //分组字段
      groupTypeOptions:[],
      //加载层配置
      loadingOptions: this.loadingOptions,
      // 查询参数
      queryParams: {
        name: undefined,
        dateGroupType:'MONTH',
        groupType:'TOTALPRICE'
      }
    };
  },
  created() {
    //加载查询条件和表单的
    this.getGoodsTypeTreeselect();
    this.getBuyTypeTreeselect();
    this.getEnumTree('GoodsConsumeType','ORDINAL',false).then(response => {
      this.consumeTypeOptions = response;
    });
    getYearTree(false).then(response => {
      this.yearsOptions = response;
    });
    this.getDictItemTree('CHART_YOY_DATE_GROUP',false).then(response => {
      this.dateGroupTypeOptions = response;
    });
    this.getDictItemTree('BUY_RECORD_GROUP_FIELD',false).then(response => {
      this.groupTypeOptions = response;
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
    /** 查询搜索条件中的商品大类下拉树结构 */
    getGoodsTypeTreeselect() {
      getGoodsTypeTree(0,'COMMON',false).then(response => {
        this.goodsTypeOptions = response;
      });
    },
    /** 查询搜索条件中的商品子类下拉树结构 */
    getSubGoodsTypeTreeselect(pid) {
      if(pid===undefined||pid===null||pid===''){
        this.subGoodsTypeOptions = [];
        this.queryParams.subGoodsType = undefined;
      }else{
        getGoodsTypeTree(pid,'COMMON',false).then(response => {
          this.subGoodsTypeOptions = response;
        });
      }
    },
    /** 查询搜索条件中的购买来源下拉树结构 */
    getBuyTypeTreeselect() {
      getBuyTypeTree(0,false).then(response => {
        this.buyTypeOptions = response;
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
      var acQueryParams = deepClone(this.queryParams);;
      acQueryParams.years = acQueryParams.years.join(',');
      this.openLoading();
      getBuyRecordYoyStat(acQueryParams).then(
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
