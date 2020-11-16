<template>
  <div class="app-container">

    <!--比较数据-->
    <el-row>
      <el-col :span="12" align="center" style="font-weight:bold;font-size: 16px;color:	#778899;" >
        <i class="el-icon-info" />AI匹配数据
      </el-col>
      <el-col :span="12"  align="center" style="font-weight:bold;font-size: 16px;color:	#778899;">
        <i class="el-icon-info" />实际消费数据
      </el-col>
    </el-row>
    <el-row>
      <el-col :span="12">
        <el-table :data="aiData">
          <el-table-column label="字段" align="center">
            <template slot-scope="{row}">
              <span>{{ row.id }}</span>
            </template>
          </el-table-column>
          <el-table-column label="值"  align="center" :show-overflow-tooltip="true">
            <template slot-scope="{row}">
              <span>{{ row.text }}</span>
            </template>
          </el-table-column>
        </el-table>
      </el-col>
      <el-col :span="12">
        <el-table :data="acData">
          <el-table-column label="字段" align="center">
            <template slot-scope="{row}">
              <span>{{ row.id }}</span>
            </template>
          </el-table-column>
          <el-table-column label="值" align="center" :show-overflow-tooltip="true">
            <template slot-scope="{row}">
              <span>{{ row.text }}</span>
            </template>
          </el-table-column>
        </el-table>
      </el-col>
    </el-row>

  </div>
</template>

<script>
  import {getCompareData} from "@/api/consume/buyRecordMatchLog";
  import {parseJsonToTree} from "@/utils/mulanbay";

export default {
  name: "CompareData",
  props: {
    //父层带过来的列表值
    logData: {
      id:undefined
    }
  },
  data() {
    return {
      defaultProps: {
        children: "children",
        label: "text"
      },
      //AI数据
      aiData:[],
      //实际数据
      acData:[]
    };
  },
  created() {
    this.handleReceiveData(this.logData);
  },
  //监听父层带过来的账户信息值
  watch:{
    logData(newVal,oldVal){
      this.logData = newVal;
      this.handleReceiveData(this.logData);
    }
  },
  methods: {
    //处理数据
    handleReceiveData(data){
      getCompareData(data.id).then(response => {
        //ai数据
        this.aiData = this.generateData(response.aiData);
        //实际数据
        this.acData = this.generateData(response.acData);
      });
    },
    //数据组装
    generateData(data){
      let list = new Array();
      list.push({id:'商品大类',text:data.goodsTypeName+'('+data.goodsTypeId+')'});
      if(data.subGoodsTypeId!=null){
        list.push({id:'商品子类',text:data.subGoodsTypeName+'('+data.subGoodsTypeId+')'});
      }else{
        list.push({id:'商品子类',text:'--'});
      }
      list.push({id:'店铺名称',text:data.shopName});
      list.push({id:'品牌名称',text:data.brand});
      list.push({id:'匹配度',text:data.match});
      return list;
    }
  }
};
</script>
