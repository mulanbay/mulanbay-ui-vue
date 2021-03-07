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
                {{ formatMoneyWithSymbal(item.amount) }}
                <span v-if="item.n>1">
                  <el-tag>{{ '×'+item.n }}</el-tag>
                </span>
              </div>
            </td>
            <td><div class="cell">{{ formatMoneyWithSymbal(item.cpPaidAmount) }}</div></td>
            <td>
              <div class="cell">
                <el-progress :percentage="item.pp" :color="customColors"></el-progress>
              </div>
            </td>
            <td>
              <div class="cell">
                <span class="link-type" @click="showChildren(item)" v-if="item.n>1"><i class="el-icon-s-grid" /></span>
                <span v-else>--</span>
              </div>
            </td>
            <td><div class="cell">{{ item.cpPaidTime }}</div></td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 子页面 -->
    <el-dialog :title="childrenTitle" width="750px" :visible.sync="childrenOpen"  append-to-body>
      <snapshot-children
        :snapshotData="snapshotData"
      />
    </el-dialog>

  </div>
</template>

<script>
  import {getList as getBudgetSnapshotData} from "@/api/fund/budgetSnapshot";
  import {getPercent,progressColors} from "@/utils/mulanbay";
  import SnapshotChildren from './snapshotChildren';

export default {
  name: "Snapshot",
  components: {
    'snapshot-children':SnapshotChildren
  },
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
      //子类
      childrenTitle:undefined,
      childrenOpen:false,
      snapshotData:{},
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
      this.childrenTitle='['+row.name+']'+row.bussKey+'预算执行列表';
      this.childrenOpen = true;
      this.snapshotData = Object.assign({}, this.snapshotData, row);
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
          for(let i=0;i<n;i++){
            let n=1;
            if(datas[i].children!=null){
              n = datas[i].children.length;
            }
            datas[i].n = n;
            if(datas[i].cpPaidAmount==null){
              datas[i].pp = 0;
            }else{
              let aiv = getPercent(datas[i].cpPaidAmount,datas[i].amount*n);
              datas[i].pp = parseInt(aiv.toFixed(0));
            }
          }
          this.snapshotList = datas;
        }
      );
    }
  }
};
</script>
