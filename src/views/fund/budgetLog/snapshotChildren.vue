<template>
  <div class="app-container">
    <div class="el-table el-table--enable-row-hover el-table--medium">
      <table cellspacing="0" style="width: 100%;">
        <thead>
          <tr>
            <th class="is-leaf"><div class="cell">业务日期</div></th>
            <th class="is-leaf"><div class="cell">预算金额</div></th>
            <th class="is-leaf"><div class="cell">实际花费</div></th>
            <th class="is-leaf"><div class="cell">比例</div></th>
            <th class="is-leaf"><div class="cell">支付时间</div></th>
          </tr>
        </thead>
        <tbody v-for="item in snapshotList">
          <tr>
            <td><div class="cell">{{ item.bussKey }}</div></td>
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
            <td><div class="cell">{{ item.cpPaidTime }}</div></td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
  import {getPercent,progressColors} from "@/utils/mulanbay";

export default {
  name: "SnapshotChildren",
  props: {
    //父层带过来的值
    snapshotData: {}
  },
  data() {
    return {
      snapshotList:[],
      //进度百分比颜色
      customColors: progressColors
    };
  },
  created() {
    this.handleReceiveData(this.snapshotData);
  },
  //监听父层带过来的值
  watch:{
    snapshotData(newVal,oldVal){
      this.snapshotData = newVal;
      this.handleReceiveData(this.snapshotData);
    }
  },
  methods: {
    /** 处理父类发起的数据 */
    handleReceiveData(data){
      this.showList(data.children);
    },
    // 预算快照列表
    showList(list){
      this.snapshotList = new Array();
      let datas = list;
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
  }
};
</script>
