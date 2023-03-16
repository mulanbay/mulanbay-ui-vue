<template>
  <div class="app-container">

  <el-form :model="queryParams" ref="queryForm" :inline="true">
    <el-form-item label="起止日期">
      <el-date-picker
        v-model="dateRange"
        size="small"
        style="width: 240px"
        value-format="yyyy-MM-dd"
        type="daterange"
        unlink-panels
        range-separator="-"
        start-placeholder="开始日期"
        end-placeholder="结束日期"
        :picker-options="datePickerOptions"
      ></el-date-picker>
    </el-form-item>
    <el-form-item label="排序方式" prop="sortType">
      <el-select
        v-model="queryParams.sortType"
        placeholder="排序方式"
        size="small"
        @change="handleQuery"
        style="width: 80px"
      >
        <el-option
          v-for="dict in sortTypeOptions"
          :key="dict.id"
          :label="dict.text"
          :value="dict.id"
        />
      </el-select>
    </el-form-item>
    <el-form-item v-if="moreCdn==true" label="类型" prop="bussType">
      <el-select
        v-model="queryParams.bussType"
        placeholder="类型"
        clearable
        size="small"
        style="width: 240px"
      >
        <el-option
          v-for="dict in bussTypeOptions"
          :key="dict.id"
          :label="dict.text"
          :value="dict.id"
        />
      </el-select>
    </el-form-item>
    <el-form-item v-if="moreCdn==true" label="名称检索" prop="name">
      <el-input
        v-model="queryParams.name"
        placeholder="请输入名称"
        clearable
        size="small"
        style="width: 240px"
        @keyup.enter.native="handleQuery"
      />
    </el-form-item>
    <el-form-item>
      <el-button type="query" icon="el-icon-search" size="mini" @click="handleQuery" v-hasPermi="['life:lifeArchives:query']">搜索</el-button>
      <el-button type="primary" icon="el-icon-plus" size="mini" @click="handleCreate" v-hasPermi="['life:lifeArchives:create']">新增</el-button>
      <el-button type="primary" icon="el-icon-more" size="mini" @click="handleMoreCdn">{{cdnTitle}}</el-button>

    </el-form-item>
  </el-form>

  <el-timeline v-loading="loading"  >
    <template v-for="item in lifeArchivesList">
        <el-timeline-item :timestamp="item.date" :type="item.type" placement="top">
          <el-card class="box-card">
            <div slot="header" class="clearfix">
              <svg-icon :icon-class="item.icon" />
              <span class="link-type" @click="handleUpdate(item)">
                {{ item.title }}
              </span>
              <el-divider direction="vertical"></el-divider>
              <el-tag>{{ item.dayDesc }}</el-tag>
              <el-divider direction="vertical"></el-divider>
              <el-tag v-if="true==item.bmn" type="danger">本命年</el-tag>
              <el-button size="mini" type="text" style="color: red;float: right; padding: 3px 0" icon="el-icon-delete" @click="handleDelete(item)"
                v-hasPermi="['life:lifeArchives:delete']">
                删除
              </el-button>
              <el-button size="mini" type="text" style="float: right; padding: 3px 0" icon="el-icon-info" @click="handleSource(item)"
                v-hasPermi="['life:lifeArchives:getSource']"  v-if="item.sourceId!=null">
                原始信息
              </el-button>
              <el-button size="mini" type="text" style="float: right; padding: 3px 0 ;color: green;" icon="el-icon-time" @click="handleTillNow(item)">
                {{item.tillNow}}
              </el-button>
            </div>
            <div>
              <el-descriptions class="margin-top" :column="1" :size="size" border labelStyle="width: 100px">
                <el-descriptions-item>
                  <template slot="label">
                    <i class="el-icon-info"></i>
                    档案内容
                  </template>
                  <div class="cell">{{ item.content }}</div>
                </el-descriptions-item>
                <el-descriptions-item>
                  <template slot="label">
                    <i class="el-icon-info"></i>
                    距离现在
                  </template>
                  <div class="cell">{{ item.tillNow }}</div>
                </el-descriptions-item>
                <el-descriptions-item>
                  <template slot="label">
                    <i class="el-icon-info"></i>
                    上条间隔
                  </template>
                  <div class="cell">{{ item.gapDaysDesc }}</div>
                </el-descriptions-item>
              </el-descriptions>
            </div>
          </el-card>
        </el-timeline-item>
      </template>
    </el-timeline>

   <pagination
     v-show="total>0"
     :total="total"
     :page.sync="queryParams.page"
     :limit.sync="queryParams.pageSize"
     @pagination="getList"
   />

  <!-- 明细页面 -->
    <el-dialog :title="detailTitle" width="650px" :visible.sync="detailOpen"  append-to-body>
      <detail :lifeArchivesData="lifeArchivesData" @closeMe="closeDetail" @refreshList="getList"/>
    </el-dialog>

    <!-- 来源详情 -->
    <el-dialog :title="sourceTitle" width="600px" :visible.sync="sourceOpen"  append-to-body customClass="customDialogCss">
      <source-detail :jsonData="jsonData"/>
    </el-dialog>

  </div>
</template>

<script>
  import {fetchList,deleteLifeArchives,getSource} from "@/api/life/lifeArchives";
  import {getBussIconClass} from "@/utils/planUtils";
  import {dateDiff,tillNowDays,formatDays} from "@/utils/datetime";
  import Detail from '../../../life/lifeArchives/detail'
  import SourceDetail from '../../../common/jsonTreeTable'

export default {
  components: {
    'detail':Detail,
    'source-detail':SourceDetail
  },
  props: {
    user: {
      type: Object
    }
  },
  data() {
    return {
      //查询条件更多属性 start
      cdnTitle:'更多',
      moreCdn:false,
      //查询条件更多属性 end
      //人生档案详情
      detailTitle:'',
      detailOpen:false,
      lifeArchivesData:{},
      //来源详情 start
      // 弹出层标题
      sourceTitle: "",
      // 是否显示弹出层
      sourceOpen: false,
      // 详情数据
      jsonData:{
        jsonObject:undefined
      },
      //来源详情 end
      sortTypeOptions:[],
      //日期范围快速选择
      datePickerOptions:this.datePickerOptions,
      // 日期范围
      dateRange: [],
      loading:false,
      lifeArchivesList:[],
      bussTypeOptions:[],
      // 查询参数
      queryParams: {
        page: 1,
        pageSize: 10,
        sortType:'desc'
      },
      // 总条数
      total: 0,
    };
  },
  created() {
    //排序方式
    this.getDictItemTree('SORT_TYPE',false).then(response => {
      this.sortTypeOptions = response;
    });
    this.getList();
    this.getEnumTree('BussType','FIELD',false).then(response => {
      this.bussTypeOptions = response;
    });
  },
  methods: {
    /** 更多查询条件处理 */
    handleMoreCdn(){
      if(this.moreCdn==true){
        //this.resetForm("queryForm");
        this.moreCdn=false;
        this.cdnTitle='更多';
      }else{
        this.moreCdn=true;
        this.cdnTitle='取消';
      }
    },
    /** 新增按钮 */
    handleCreate(){
      this.detailTitle='新增';
      this.detailOpen=true;
      this.lifeArchivesData={
        id:undefined,
        title:undefined,
        content:undefined,
        date:undefined,
        bussType:undefined,
        relatedBeans:undefined,
        sourceId:undefined,
        remark:undefined
      };
    },
    /** 修改按钮 */
    handleUpdate(row){
      this.detailTitle='修改';
      this.detailOpen=true;
      this.lifeArchivesData = Object.assign({}, this.lifeArchivesData, row);
    },
    /** 删除按钮 */
    handleDelete(row){
      const ids = row.id;
      this.$confirm('是否确认删除"' + row.title + '"?', "警告", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }).then(function() {
          return deleteLifeArchives(ids);
        }).then(() => {
          this.getList();
          this.msgSuccess("删除成功");
        }).catch(function() {});
    },
    /** 关闭按钮 */
    closeDetail(){
      this.detailOpen=false;
    },
    /** 原始内容按钮 */
    handleSource(row){
      getSource(row.id).then(response => {
        this.sourceOpen = true;
        this.sourceTitle = "原始内容详情";
        this.jsonData = Object.assign({}, this.jsonData, {
          jsonObject: response,
        });
      });
    },
    /** 距今时间按钮 */
    handleTillNow(row){
      this.msgAlert('距离现在',this.getTillNow(row));
    },
    /** 获取距今时间 */
    getTillNow(row){
      let days = tillNowDays(null,row.date);
      let ss = formatDays(0-days);
      if(days<-30){
        ss+='('+(0-days).toFixed(0)+'天)';
      }
      return ss;
    },
    /** 查询列表 */
    getList() {
      this.loading = true;
      fetchList(this.addDateRange(this.queryParams, this.dateRange)).then(
        response => {
          this.lifeArchivesList = new Array();
          let datas = response.rows;
          const n = datas.length;
          for(let i=0;i<n;i++){
            let d = datas[i];
            d.icon = getBussIconClass(d.bussType);
            const birthday = this.user.birthday;
            let days = dateDiff(birthday,d.date);
            if(days<=31){
              d.dayDesc = days+'天';
            }else if(days<=366){
              d.dayDesc = (days/30).toFixed(0)+'个月';
            }else{
              let years = (days/365).toFixed(0);
              if(years%12===0){
                d.bmn = true;
              }
              d.dayDesc = years+'岁';
            }
            d.type='primary';
            d.tillNow = this.getTillNow(d);
            //计算档案间的间隔
            if(n>1&&i<n-1){
              let previousData = datas[i+1];
              let gapDays = dateDiff(previousData.date,d.date);
              let gapDaysDesc = formatDays(gapDays);
              d.gapDaysDesc = gapDaysDesc +'(-->'+previousData.title+')';
            }
            this.lifeArchivesList.push(d);
          }
          this.total = response.total;
          this.loading = false;
        }
      );
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.page = 1;
      this.getList();
    }
  }
};
</script>
