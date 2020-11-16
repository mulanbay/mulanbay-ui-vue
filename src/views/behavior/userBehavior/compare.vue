<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true">
      <el-form-item label="源配置" prop="sourceUserBehaviorId">
        <treeselect
         v-model="queryParams.sourceUserBehaviorId"
         style="width: 240px"
         :options="userBehaviorOptions"
         :disable-branch-nodes="true"
         :show-count="true"
         :searchable="true"
         placeholder="请选择行为配置"
         />
      </el-form-item>
      <el-form-item label="源关键字" prop="sourceName">
        <el-input
          v-model="queryParams.sourceName"
          placeholder="请输入名称"
          clearable
          size="small"
          style="width: 240px"
        />
      </el-form-item>
      <el-form-item label="目标配置" prop="targetUserBehaviorId">
        <treeselect
         v-model="queryParams.targetUserBehaviorId"
         style="width: 240px"
         :options="userBehaviorOptions"
         :disable-branch-nodes="true"
         :show-count="true"
         :searchable="true"
         placeholder="请选择行为配置"
         />
      </el-form-item>
      <el-form-item label="目标关键字" prop="targetName">
        <el-input
          v-model="queryParams.targetName"
          placeholder="请输入名称"
          clearable
          size="small"
          style="width: 240px"
        />
      </el-form-item>
      <el-form-item label="选择年份">
        <el-date-picker
          v-model="queryParams.year"
          type="year"
          size="medium"
          style="width: 230px"
          value-format="yyyy"
          placeholder="选择年">
        </el-date-picker>
      </el-form-item>
      <el-form-item>
        <el-button type="stat" icon="el-icon-s-data" size="mini" @click="handleQuery" v-hasPermi="['behavior:userBehavior:compare']">统计</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
        <el-button type="stat" icon="el-icon-s-data" size="mini" @click="showCompareData" v-hasPermi="['behavior:userBehavior:compare']">比对列表</el-button>
      </el-form-item>
    </el-form>

    <!--图表数据-->
    <div>
      <common-chart :chartData="chartData"/>
    </div>

    <!-- 比对列表对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="600px" append-to-body customClass="customDialogCss">
      <el-table :data="compareDataList" >
        <el-table-column :label="sourceTitle" align="center">
          <template slot-scope="{row}">
            <span v-if="row.days>=0&&row.days<=3">
             <span style="color:red">
              {{ row.sourceDate }}
             </span>
            </span>
            <span v-else>
              {{ row.sourceDate }}
            </span>
          </template>
        </el-table-column>
        <el-table-column :label="targetTitle"  align="center">
          <template slot-scope="{row}">
            <span>{{ row.targetDate }}</span>
          </template>
        </el-table-column>
        <el-table-column label="相差天数"  align="center">
          <template slot-scope="{row}">
            <span v-if="row.days==-1">
             <span>
              --
             </span>
            </span>
            <span v-else>
              {{ row.days }}
            </span>
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>

  </div>
</template>

<script>
  import {getUserBehaviorTree,getUserBehaviorCompare} from "@/api/behavior/userBehavior";
  import CommonChart from '../../chart/commonChart'
  import {getPercent} from "@/utils/mulanbay";
  import {getYear} from "@/utils/datetime";

  import Treeselect from "@riophae/vue-treeselect";
  import "@riophae/vue-treeselect/dist/vue-treeselect.css";

export default {
  name: "Stat",
  components: {
    Treeselect,
    'common-chart':CommonChart
  },
  mounted() {
     //this.initChart();
  },
  data() {
    return {
      //比对数据
      title:'',
      open:false,
      compareDataList:[],
      sourceTitle:'',
      targetTitle:'',
      //图表数据
      chartData:{},
      // 加载层信息
      loading: [],
      //加载层配置
      loadingOptions:this.loadingOptions,
      userBehaviorOptions:[],      // 查询参数
      queryParams: {

      }
    };
  },
  created() {
    getUserBehaviorTree(null,false).then(response => {
      this.userBehaviorOptions = response;
    });
    this.queryParams.year=getYear(0)+'';
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
    /** 打开比对列表 */
    showCompareData(){
      if(this.compareDataList.length==0){
        this.msgError('无数据，请先进行统计');
        return;
      }
      this.title='比对列表';
      this.open=true;
    },
    /** 组装比对列表 */
    handleCompareData(legendData,data){
      this.compareDataList=[];
      this.sourceTitle = legendData[0];
      this.targetTitle =  legendData[1];
      let counts=0;
      let n = data.length;
      for (let i = 0; i < n; i++) {
        let days = data[i].days;
        let sourceDate =data[i].sourceDate;
        let row = {
          sourceDate:sourceDate,
          targetDate:data[i].targetDate,
          days:days
        };
        if(data[i].sourceDate!=null){
          counts++;
        }
        this.compareDataList.push(row);
      }
      let tr = {
        sourceDate:'总条数:'+n+'条',
        targetDate:'匹配数:'+counts+'次',
        days:'占比:'+getPercent(counts,n).toFixed(0)+'%'
      };
      this.compareDataList.push(tr);
    },
    initChart() {
      let v = this.queryParams.year;
      if(this.isObjectEmpty(v)){
        this.msgError('请选择年份');
        return;
      }
      this.openLoading();
      getUserBehaviorCompare(this.queryParams).then(
        response => {
          //组装chart数据
          response.chartType='COMPARE_CALANDER';
          this.chartData = response;
          this.handleCompareData(response.legendData,response.customData);
          this.loading.close();
        }
      );
    }
  }
};
</script>
