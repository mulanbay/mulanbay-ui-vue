<template>
  <div class="app-container">
    <div class="el-table el-table--enable-row-hover el-table--medium">
      <table cellspacing="0" style="width: 100%;">
        <thead>
          <tr>
            <th class="is-leaf"><div class="cell">ID</div></th>
            <th class="is-leaf"><div class="cell">名称</div></th>
            <th class="is-leaf"><div class="cell">类型</div></th>
            <th class="is-leaf"><div class="cell">周期</div></th>
            <th class="is-leaf"><div class="cell">预算金额</div></th>
            <th class="is-leaf"><div class="cell">实际花费</div></th>
            <th class="is-leaf"><div class="cell">比例</div></th>
            <th class="is-leaf"><div class="cell">数据来源</div></th>
            <th class="is-leaf"><div class="cell">详情</div></th>
            <th class="is-leaf"><div class="cell">支付时间</div></th>
          </tr>
        </thead>
        <tbody v-for="item in snapshotList">
          <tr>
            <td><div class="cell">{{ item.id }}</div></td>
            <td><div class="cell">{{ item.name }}</div></td>
            <td><div class="cell">{{ item.typeName }}</div></td>
            <td><div class="cell">{{ item.periodName }}</div></td>
            <td>
              <div class="cell">
                <span v-if="item.hasChild==true">
                  --
                </span>
                <span v-else>
                  {{ formatMoneyWithSymbal(item.amount) }}
                </span>
              </div>
            </td>
            <td><div class="cell">{{ formatMoneyWithSymbal(item.cpPaidAmount) }}</div></td>
            <td>
              <div class="cell">
                <span v-if="item.hasChild==true">
                  --
                </span>
                <span v-else>
                  <el-progress :percentage="parseInt(item.rate.toFixed(0))" :color="customColors"></el-progress>
                </span>
              </div>
            </td>
            <td><div class="cell">{{ item.sourceName }}</div></td>
            <td>
              <div class="cell">
                <span class="link-type" @click="showChildren(item)" v-if="item.hasChild==true"><i class="el-icon-s-grid" /></span>
                <span v-else>--</span>
              </div>
            </td>
            <td><div class="cell">{{ item.cpPaidTime }}</div></td>
          </tr>
        </tbody>
      </table>
    </div>

  </div>
</template>

<script>
  import {getList as getBudgetSnapshotData} from "@/api/fund/budgetSnapshot";
  import {getPercent,progressColors} from "@/utils/mulanbay";

export default {
  name: "BudgetSnapshot",
  props: {
    //父层带过来的值
    budgetData: {
      budgetLogId: undefined
    }
  },
  data() {
    return {
      //快照数据
      snapshotList:[],
      //进度百分比颜色
      customColors: progressColors
    };
  },
  created() {
    //this.handleReceiveData(this.budgetData);
  },
  //监听父层带过来的值
  watch:{
    budgetData(newVal,oldVal){
      this.budgetData = newVal;
      this.handleReceiveData(this.budgetData);
    }
  },
  methods: {
    /** 处理父类发起的数据 */
    handleReceiveData(data){
      this.getSnapshotList(data.budgetLogId);
    },
    /** 展示子类 */
    showChildren(row){
      this.$router.push({name:'BudgetSnapshotChildren',query: {snapshotId:row.snapshotId}})
    },
    /** 预算快照列表 */
    getSnapshotList(budgetLogId){
      let para = {
        budgetLogId:budgetLogId,
        page:0,
        needTotal:false
      };
      getBudgetSnapshotData(para).then(
        response => {
          this.snapshotList = new Array();
          let datas = response;
          const n = datas.length;
          this.snapshotList = datas;
        }
      );
    }
  }
};
</script>
