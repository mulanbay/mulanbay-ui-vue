<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true" >
      <el-form-item label="配置" prop="id">
        <el-select
          v-model="queryParams.id"
          placeholder="商品类型"
          clearable
          size="medium"
          style="width: 220px"
          @change="match"
        >
          <el-option
            v-for="dict in lifetimeOptions"
            :key="dict.id"
            :label="dict.text"
            :value="dict.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-refresh" size="mini" @click="matchNext()" v-hasPermi="['config:goodsLifetime:getAndMath']">换一批</el-button>
        <el-button type="primary" icon="el-icon-plus" size="mini" @click="handleCreate()" v-hasPermi="['consume:goodsLifetime:create']">新增</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="32" v-loading="loading" >
      <el-col :span="24" class="card-box">
        <div>
          <el-descriptions class="margin-top" :column="1" :size="'5'" border :labelStyle="{width: '100px'}" >
            <el-descriptions-item>
              <template slot="label">
                <i class="el-icon-star-on"></i>
                匹配分类
              </template>
              <div class="cell">{{ matchInfo.name }}</div>
            </el-descriptions-item>
            <el-descriptions-item>
              <template slot="label">
                <i class="el-icon-star-on"></i>
                匹配度
              </template>
              <div class="cell">{{ matchInfo.match }}</div>
            </el-descriptions-item>
            <el-descriptions-item>
              <template slot="label">
                <i class="el-icon-star-on"></i>
                设计寿命
              </template>
              <div class="cell">
              {{ matchInfo.daysInfo }}
              <el-button type="success" icon="el-icon-edit" size="mini" @click="handleUpdate()" v-hasPermi="['consume:goodsLifetime:edit']">修改</el-button>
              </div>
            </el-descriptions-item>
            <el-descriptions-item v-if="matchInfo.usedDaysInfo!=null">
              <template slot="label">
                <i class="el-icon-star-on"></i>
                使用时长
              </template>
              <div class="cell">{{ matchInfo.usedDaysInfo }}</div>
            </el-descriptions-item>
            <el-descriptions-item v-if="matchInfo.usedRateInfo!=null">
              <template slot="label">
                <i class="el-icon-star-on"></i>
                实际/设计
              </template>
              <div class="cell">{{ matchInfo.usedRateInfo }}</div>
            </el-descriptions-item>
          </el-descriptions>
        </div>
      </el-col>
    </el-row>

    <el-row type="flex" class="row-bg" justify="end">
      <el-col :span="6">
        <div class="grid-content bg-purple-light">
          <span v-if="lifetimeCompareData.needCallback==true"  slot="footer" class="dialog-footer">
            </br>
            <el-button type="primary" icon="el-icon-circle-check" @click="handleConfirm()" >确定</el-button>
          </span>
        </div>
        </el-col>
    </el-row>

    <!--寿命配置表单 -->
    <el-dialog :title="formTitle" width="600px" :visible.sync="formOpen" append-to-body>
      <goods-lifetime-form :goodsLifetimeData="goodsLifetimeData" @confirmLifetimeForm="confirmLifetimeForm" @closeMe="formOpen=false"/>
    </el-dialog>

  </div>
</template>

<script>
  import {getAndMathGoodsLifetime,compareAndMathGoodsLifetime} from "@/api/consume/goodsLifetime";
  import {formatDays} from "@/utils/datetime";
  import {getPercent} from "@/utils/mulanbay";
  import GoodsLifetimeForm from './form'

export default {
  name: "GoodsLifetimeCompare",
  components: {
    'goods-lifetime-form':GoodsLifetimeForm
  },
  props: {
    lifetimeCompareData: {
      goodsName: undefined,
      usedDays: undefined,
      needCallback: false
    }
  },
  data() {
    return {
      // 遮罩层
      loading: false,
      // 查询参数
      queryParams: {
        keywords:undefined
      },
      page: 1,
      pageSize: 10,
      lifetimeOptions:[],
      //匹配信息
      matchInfo:{},
      //表单修改
      goodsLifetimeData:{},
      formTitle: '',
      formOpen: false
    };
  },
  created() {
    this.handleReceiveData(this.lifetimeCompareData);
  },
  watch: {
    lifetimeCompareData: {
      deep: true,
      handler(val) {
        this.lifetimeCompareData=val;
        this.handleReceiveData(this.lifetimeCompareData);
      }
    }
  },
  methods: {
    /** 处理父类发起的数据 */
    handleReceiveData(data){
      if(data.goodsName==null){
        return;
      }
      this.page=1;
      this.getAndMath();
    },
    /** 获取和匹配 */
    getAndMath(){
      this.loading = true;
      let para = {
        goodsName: this.lifetimeCompareData.goodsName,
        page: this.page,
        pageSize: this.pageSize
      };
      getAndMathGoodsLifetime(para).then(response => {
        this.loading = false;
        let configList = response.configs.beanList;
        let n = configList.length;
        if(n<=0){
          this.msgError('没有更多数据');
          this.page =0;
          return;
        }
        this.lifetimeOptions = [];
        for (let index=0; index < n; index++) {
         let elem = configList[index];
         this.lifetimeOptions.push({
           id: elem.id,
           text: elem.name
         });
        }
        this.matchInfo = response.match;
        if(this.matchInfo!=null){
          this.queryParams.id = this.matchInfo.id;
          this.matchInfo.daysInfo = formatDays(this.matchInfo.days);
        }else{
          this.matchInfo = {};
        }
        this.compareUseInfo();
      });
    },
    /** 下拉框选择操作操作 */
    match(val){
      this.loading = true;
      this.queryParams.goodsName = this.lifetimeCompareData.goodsName;
      compareAndMathGoodsLifetime(this.queryParams).then(response => {
        this.matchInfo = response;
        this.matchInfo.daysInfo = formatDays(this.matchInfo.days);
        this.compareUseInfo();
        this.loading = false;
      });
    },
    /** 比对实际使用 */
    compareUseInfo(){
      let usedDays = this.lifetimeCompareData.usedDays;
      if(usedDays!=null){
        this.matchInfo.usedDaysInfo = formatDays(usedDays);
        let p =0;
        if(this.matchInfo.days>=usedDays){
          p = getPercent(usedDays,this.matchInfo.days).toFixed(0)+'%';
        }else{
          p = (usedDays / this.matchInfo.days ).toFixed(1)+'倍';
        }
        this.matchInfo.usedDays = usedDays;
        this.matchInfo.usedRateInfo = p;
      }
    },
    /** 换一批按钮操作 */
    matchNext(){
      this.page = this.page+1;
      this.getAndMath();
    },
    /** 确定按钮操作 */
    handleConfirm(){
      const mi={
        days:this.matchInfo.days,
        match:this.matchInfo.match
      }
      //调用父组件的方法
      this.$emit('confirmLifetimeCompare',mi);
    },
    /** 搜索按钮操作 */
    handleQuery() {

    },
    /** 新增按钮操作 */
    handleCreate() {
      this.formTitle = '新增';
      this.formOpen = true;
      this.goodsLifetimeData = Object.assign({}, this.goodsLifetimeData, {
        id: undefined
      });
    },
    /** 修改按钮操作 */
    handleUpdate() {
      this.formTitle = '修改';
      this.formOpen = true;
      this.goodsLifetimeData = Object.assign({}, this.goodsLifetimeData, {
        id: this.queryParams.id
      });
    },
    /** 表单提交完成 */
    confirmLifetimeForm(data){
      this.formOpen = false;
      if(data.update==false){
        //新增回第一页
        this.page =1;
      }
      this.getAndMath();
    }
  }
};
</script>
<style lang="scss" scoped>
@media (max-width:1024px) {
  .chart-wrapper {
    padding: 8px;
  }
}
</style>
