<template>
  <div class="app-container">

    <el-row :gutter="32" v-loading="loading" >
        <el-col :span="24" class="card-box">
          <el-card>
          <div>
            <el-descriptions class="margin-top" :column="1" :size="'5'" border :labelStyle="{width: '100px'}" >
              <el-descriptions-item>
                <template slot="label">
                  <i class="el-icon-star-on"></i>
                  商品名称
                </template>
                <div class="cell">{{ goodsName }}</div>
              </el-descriptions-item>
              <el-descriptions-item>
                <template slot="label">
                  <i class="el-icon-star-on"></i>
                  比较目标
                </template>
                <div class="cell">{{ compareGoodsName }}</div>
              </el-descriptions-item>
            </el-descriptions>
          </div>
          </el-card>
        </el-col>
    </el-row>
    <!--比较数据-->
    <el-row>
      <el-col :span="12">
        <el-card>
          <el-divider><i class="el-icon-info"></i>AI匹配数据</el-divider>
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
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card>
          <el-divider><i class="el-icon-info"></i>实际消费数据</el-divider>
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
        </el-card>
      </el-col>
    </el-row>

  </div>
</template>

<script>
  import {getCompareData} from "@/api/consume/buyRecordMatchLog";
  import {parseJsonToTree} from "@/utils/mulanbay";

export default {
  name: "BuyRecordMatchLogCompareData",
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
      loading:false,
      goodsName:undefined,
      compareGoodsName:undefined,
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
    /** 重置 */
    reset(){
      this.goodsName = undefined;
      this.compareGoodsName = undefined;
      //ai数据
      this.aiData = [];
      //实际数据
      this.acData = [];
    },
    /** 处理数据 */
    handleReceiveData(data){
      this.loading = true;
      this.reset();
      getCompareData(data.id).then(response => {
        this.goodsName = response.goodsName;
        this.compareGoodsName = response.compareGoodsName;
        //ai数据
        this.aiData = this.generateData(response.aiData);
        //实际数据
        this.acData = this.generateData(response.acData);
        this.loading = false;

      });
    },
    /** 数据组装 */
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
