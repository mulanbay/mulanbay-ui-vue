<template>
  <div class="app-container">
    <div class="el-table el-table--enable-row-hover el-table--medium">
      <table cellspacing="0" style="width: 100%;">
        <thead>
          <tr>
            <td class="el-table__cell is-leaf"><div class="cell">ID</div></td>
            <td class="el-table__cell is-leaf"><div class="cell">名称</div></td>
            <td class="el-table__cell is-leaf"><div class="cell">类型</div></td>
            <td class="el-table__cell is-leaf"><div class="cell">周期</div></td>
            <td class="el-table__cell is-leaf"><div class="cell">预算金额</div></td>
            <td class="el-table__cell is-leaf"><div class="cell">实际花费</div></td>
            <td class="el-table__cell is-leaf"><div class="cell">比例</div></td>
            <td class="el-table__cell is-leaf"><div class="cell" align="center">数据来源</div></td>
            <td class="el-table__cell is-leaf"><div class="cell" align="center">详情</div></td>
            <td class="el-table__cell is-leaf"><div class="cell" align="center">明细</div></td>
            <td class="el-table__cell is-leaf"><div class="cell" align="center">历史</div></td>
            <td class="el-table__cell is-leaf"><div class="cell">支付时间</div></td>
          </tr>
        </thead>
        <tbody v-for="item in snapshotList">
          <tr>
            <td class="el-table__cell is-leaf"><div class="cell">{{ item.id }}</div></td>
            <td class="el-table__cell is-leaf"><div class="cell">{{ item.name }}</div></td>
            <td class="el-table__cell is-leaf"><div class="cell">{{ item.typeName }}</div></td>
            <td class="el-table__cell is-leaf"><div class="cell">{{ item.periodName }}</div></td>
            <td class="el-table__cell is-leaf">
              <div class="cell">
                <span v-if="item.hasChild==true">
                  --
                </span>
                <span v-else>
                  {{ formatMoney(item.amount) }}
                </span>
              </div>
            </td>
            <td class="el-table__cell is-leaf"><div class="cell">{{ formatMoney(item.cpPaidAmount) }}</div></td>
            <td class="el-table__cell is-leaf">
              <div class="cell">
                <span v-if="item.hasChild==true">
                  --
                </span>
                <span v-else>
                  <el-progress :percentage="parseInt(item.rate.toFixed(0))" :color="customColors"></el-progress>
                </span>
              </div>
            </td>
            <td class="el-table__cell is-leaf"><div class="cell" align="center">{{ item.sourceName }}</div></td>
            <td class="el-table__cell is-leaf">
              <div class="cell" align="center">
                <span class="link-type" @click="showChildren(item)" v-if="item.hasChild==true"><i class="el-icon-s-grid" /></span>
                <span v-else>--</span>
              </div>
            </td>
            <td class="el-table__cell is-leaf">
              <div class="cell" align="center">
                <span class="link-type" @click="showConsume(item)"  v-if="item.feeType!=null"><i class="el-icon-s-grid" /></span>
                <span v-else>--</span>
              </div>
            </td>
            <td class="el-table__cell is-leaf">
              <div class="cell" align="center">
                <span class="link-type" @click="showHistory(item)"><i class="el-icon-s-grid" /></span>
              </div>
            </td>
            <td class="el-table__cell is-leaf"><div class="cell">{{ item.cpPaidTime }}</div></td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 交易记录 -->
    <el-dialog :title="buyRecordTitle" width="750px" :visible.sync="buyRecordOpen">
      <buy-record :snapshotData="snapshotDataBR" />
    </el-dialog>

    <!-- 看病记录 -->
    <el-dialog :title="treatRecordTitle" width="750px" :visible.sync="treatRecordOpen">
      <treat-record :snapshotData="snapshotDataTR" />
    </el-dialog>

  </div>
</template>

<script>
  import {getList as getBudgetSnapshotData} from "@/api/fund/budgetSnapshot";
  import {getPercent,progressColors} from "@/utils/mulanbay";
  import BuyRecord from './buyRecord';
  import TreatRecord from './treatRecord';

export default {
  name: "BudgetSnapshot",
  components: {
    'buy-record':BuyRecord,
    'treat-record':TreatRecord
  },
  props: {
    //父层带过来的值
    budgetData: {
      budgetLogId: undefined
    }
  },
  data() {
    return {
      //交易记录
      buyRecordTitle:'',
      buyRecordOpen:false,
      snapshotDataBR:{
        snapshotId:undefined
      },
      //看病记录
      treatRecordTitle:'',
      treatRecordOpen:false,
      snapshotDataTR:{
        snapshotId:undefined
      },
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
    /** 展示历史 */
    showHistory(row){
      this.$router.push({name:'BudgetSnapshotHistory',query: {budgetId:row.id}})
    },
    /** 展示消费 */
    showConsume(row){
      switch(row.feeType){
        case 'BUY_RECORD':
          this.showBuyRecord(row);
          break;
        case 'TREAT_RECORD':
          this.showTreatRecord(row);
          break;
        default:
          this.msgAlert("无法查询相关记录");
      }

    },
    /** 展示交易记录 */
    showBuyRecord(row){
      this.buyRecordTitle="["+row.name+"]"+row.bussKey+"交易记录";
      this.buyRecordOpen = true;
      this.snapshotDataBR = {
        snapshotId: row.snapshotId
      };
    },
    /** 展示看病记录 */
    showTreatRecord(row){
      this.treatRecordTitle="["+row.name+"]"+row.bussKey+"看病记录";
      this.treatRecordOpen = true;
      this.snapshotDataTR = {
        snapshotId: row.snapshotId
      };
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
