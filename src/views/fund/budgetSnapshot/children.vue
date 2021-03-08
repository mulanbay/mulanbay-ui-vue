<template>
  <div class="app-container">

    <div class="el-table el-table--enable-row-hover el-table--medium">
      <table cellspacing="0" style="width: 100%;">
        <tbody>
          <tr>
            <td><div class="cell">预算总计</div></td>
            <td><div class="cell" >{{ formatMoneyWithSymbal(sumData.budgetAmount) }}</div></td>
            <td><div class="cell">实际花费</div></td>
            <td><div class="cell" >{{ formatMoneyWithSymbal(sumData.cpPaidAmount) }}</div></td>
          </tr>
          <tr>
            <td><div class="cell">业务日期</div></td>
            <td><div class="cell" >{{ sumData.bussKey }}</div></td>
            <td><div class="cell">预算比例</div></td>
            <td>
              <div class="cell" >
                <el-progress :percentage="parseInt(sumData.rate.toFixed(0))" :color="customColors"></el-progress>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

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
          <span>{{ formatMoneyWithSymbal(row.cpPaidAmount)  }}</span>
        </template>
      </el-table-column>
      <el-table-column label="实际花费" align="center" >
        <template slot-scope="{row}">
          <span>{{ formatMoneyWithSymbal(row.cpPaidAmount)  }}</span>
        </template>
      </el-table-column>
      <el-table-column label="花费/预算比例" align="center" >
        <template slot-scope="{row}">
          <span>
            <el-progress :percentage="parseInt(row.rate.toFixed(0))" :color="customColors"></el-progress>
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

export default {
  name: "Children",
  data() {
    return {
      // 遮罩
      loading: true,
      //统计信息
      sumData:{
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
        snapshotId:undefined
      },
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
          this.sumData = {
            budgetAmount:response.budgetAmount,
            cpPaidAmount:response.cpPaidAmount,
            bussKey:response.bussKey,
            rate:response.rate
          }
          this.snapshotList = new Array();
          let datas = response.children;
          this.snapshotList = datas;
        }
      );
    }
  }
};
</script>
