<template>
  <el-tabs v-loading="loading"  v-model="activeName" @tab-click="handleClick">
    <el-tab-pane label="上级商品" name="parentGoods">
      <parent-goods :buyRecordCCData="buyRecordCCData" />
    </el-tab-pane>
    <el-tab-pane label="下级商品" name="childrenGoods">
      <children-goods :buyRecordCCData="buyRecordCCData" />
    </el-tab-pane>
  </el-tabs>
</template>

<script>
  import ParentGoods from './parentGoods'
  import ChildrenGoods from './childrenGoods'
  
export default {
  name: "BuyRecordCascade",
  props: {
      //父层带过来的信息值
      buyRecordData: {id:undefined}
  },
  components: {
    'parent-goods':ParentGoods,
    'children-goods':ChildrenGoods,
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
