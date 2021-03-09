<template>
  <div class="dashboard-editor-container">

    <!--统计数据-->
    <children-stat :statData="statData"/>

    <!--图表数据-->
    <div>
      <common-chart :chartData="chartData"/>
    </div>

    <el-divider></el-divider>

    <!--列表数据-->
    <el-table v-loading="loading" :data="snapshotList">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="业务日期" prop="id"  sortable="custom" align="center" width="100">
        <template slot-scope="{row}">
          <span>{{ row.bussKey }}</span>
        </template>
      </el-table-column>
      <el-table-column label="预算金额" align="center" >
        <template slot-scope="{row}">
          <span>{{ formatMoney(row.amount)  }}</span>
        </template>
      </el-table-column>
      <el-table-column label="实际花费" align="center" >
        <template slot-scope="{row}">
          <span>{{ formatMoney(row.cpPaidAmount)  }}</span>
          <span v-if="row.rate>100">
           <el-tag type="danger" size="mini">超支</el-tag>
          </span>
        </template>
      </el-table-column>
      <el-table-column label="花费/预算比例" align="center" >
        <template slot-scope="{row}">
          <span>
            {{row.rate.toFixed(0)+'%'}}
          </span>
        </template>
      </el-table-column>
      <el-table-column label="数据来源" align="center" >
        <template slot-scope="{row}">
          <span>{{ row.sourceName  }}</span>
        </template>
      </el-table-column>
      <el-table-column label="支付时间" min-width="180px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.cpPaidTime  }}</span>
        </template>
      </el-table-column>
    </el-table>

  </div>
</template>

<script>
  import {getPercent,progressColors} from "@/utils/mulanbay";
  import {getChildren} from "@/api/fund/budgetSnapshot";
  import {getQueryObject} from "@/utils/index";
  import ChildrenStat from './childrenStat'
  import CommonChart from '../../chart/commonChart'

export default {
  name: "BudgetSnapshotChildren",
  components: {
    'children-stat':ChildrenStat,
    'common-chart':CommonChart
  },
  data() {
    return {
      // 遮罩
      loading: true,
      //统计信息
      statData:{
        budgetAmount:0,
        cpPaidAmount:0,
        bussKey:undefined,
        rate:0
      },
      snapshotList:[],
      //进度百分比颜色
      customColors: progressColors,
      // 查询参数
      queryParams: {
        snapshotId:undefined,
        needChart:true
      },
      //图表数据
      chartData:{}
    };
  },
  created() {
    let qb = getQueryObject(null);
    this.queryParams.snapshotId = qb.snapshotId;
    this.getSnapshotList();
  },
  methods: {
    /** 预算快照列表 */
    getSnapshotList(){
      this.loading = true;
      getChildren(this.queryParams).then(
        response => {
          this.loading = false;
          if(response==null){
            this.msgAlert("未找到相关数据");
            return;
          }
          this.statData = {
            budgetAmount:response.budgetAmount,
            cpPaidAmount:response.cpPaidAmount,
            bussKey:response.bussKey,
            rate:response.rate
          }
          this.snapshotList = new Array();
          let datas = response.children;
          this.snapshotList = datas;
          this.chartData = response.chartData;
          this.chartData.height='350px';
          this.chartData.chartType='MIX_LINE_BAR';
        }
      );
    }
  }
};
</script>
