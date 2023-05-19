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
        <el-button type="primary" icon="el-icon-d-arrow-left" size="mini" @click="matchPrevious()" v-hasPermi="['config:goodsLifetime:getAndMath']">上一批</el-button>
        <el-button type="primary" icon="el-icon-d-arrow-right" size="mini" @click="matchNext()" v-hasPermi="['config:goodsLifetime:getAndMath']">下一批</el-button>
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

  </div>
</template>

<script>
  import {getAndMathGoodsLifetime,compareAndMathGoodsLifetime} from "@/api/consume/goodsLifetime";
  import {formatDays} from "@/utils/datetime";

export default {
  name: "GoodsLifetimeCompare",
  props: {
    lifetimeCompareData: {
      goodsName: undefined,
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
      matchInfo:{}
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
        let configList = response.configs.beanList;
        let n = configList.length;
        if(n<=0){
          this.msgError('没有更多数据');
          this.page =1;
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
        this.loading = false;
      });
    },
    /** 下拉框选择操作操作 */
    match(val){
      this.loading = true;
      this.queryParams.goodsName = this.lifetimeCompareData.goodsName;
      compareAndMathGoodsLifetime(this.queryParams).then(response => {
        this.matchInfo = response;
        this.matchInfo.daysInfo = formatDays(this.matchInfo.days);
        this.loading = false;
      });
    },
    /** 上一批按钮操作 */
    matchPrevious(){
      if(this.page<=1){
        this.msgError('没有更多数据');
        return;
      }
      this.page = this.page-1;
      this.getAndMath();
    },
    /** 下一批按钮操作 */
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
      this.msgError('未实现');
    },
    /** 修改按钮操作 */
    handleUpdate() {
      this.msgError('未实现');
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
