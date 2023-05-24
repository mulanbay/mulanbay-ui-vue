<template>
  <div class="app-container">

    <el-tabs v-loading="loading"  v-model="activeName" @tab-click="handleClick">
      <el-tab-pane label="上级商品" name="parentGoods">
        <parent-goods :buyRecordCCData="buyRecordCCData" />
      </el-tab-pane>
      <el-tab-pane label="下级商品" name="childrenGoods">
        <children-goods :buyRecordCCData="buyRecordCCData" />
      </el-tab-pane>
      <el-tab-pane label="寿命/成本" name="useTime">
        <use-time :buyRecordCCData="buyRecordCCData" />
      </el-tab-pane>
      <el-tab-pane label="关联图" name="treeStat">
        <tree-stat :buyRecordTSData="buyRecordCCData" />
      </el-tab-pane>
    </el-tabs>

  </div>
</template>

<script>
  import ParentGoods from './parentGoods'
  import ChildrenGoods from './childrenGoods'
  import UseTime from '../useTimeDetail'
  import TreeStat from './treeStat'

export default {
  name: "BuyRecordCascade",
  props: {
      //父层带过来的信息值
      buyRecordData: {id:undefined}
  },
  components: {
    'parent-goods':ParentGoods,
    'children-goods':ChildrenGoods,
    'use-time':UseTime,
    'tree-stat':TreeStat
  },
  mounted() {
     //this.initChart();
  },
  data() {
    return {
      loading:false,
      buyRecordCCData:{id:undefined},
      activeName:'parentGoods'
    };
  },
  created() {
    this.handleReceiveData(this.buyRecordData);
  },
  //监听父层带过来的账户信息值
  watch:{
    buyRecordData: {
      deep: true,
      handler(val) {
        this.buyRecordData =val;
        this.handleReceiveData(this.buyRecordData);
      }
    }
  },
  methods: {
    handleClick(tab, event) {
      //console.log(tab, event);
    },
    /** 处理父类发起的数据 */
    handleReceiveData(data){
      this.loadBuyRecord(data.id);
    },
    //加载明细
    loadBuyRecord(id){
      this.buyRecordCCData = Object.assign({}, this.buyRecordCCData, {
        id: id
      });
    }
  }
};
</script>
