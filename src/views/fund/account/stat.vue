<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true">
      <el-form-item label="数据分组" prop="groupType">
        <el-select
          v-model="queryParams.groupType"
          placeholder="数据分组"
          clearable
          size="small"
          style="width: 240px"
        >
          <el-option
            v-for="dict in groupTypeOptions"
            :key="dict.id"
            :label="dict.text"
            :value="dict.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="账户类型" prop="type">
        <el-select
          v-model="queryParams.type"
          placeholder="类型"
          clearable
          size="small"
          style="width: 120px"
        >
          <el-option
            v-for="dict in typeOptions"
            :key="dict.id"
            :label="dict.text"
            :value="dict.id"
          />
        </el-select>
        <el-select
          v-model="queryParams.status"
          placeholder="资产状态"
          clearable
          size="small"
          style="width: 115px"
        >
          <el-option
            v-for="dict in statusOptions"
            :key="dict.id"
            :label="dict.text"
            :value="dict.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="快照名称" prop="snapshotId">
        <el-select
          v-model="queryParams.snapshotId"
          placeholder="快照"
          clearable
          size="small"
          style="width: 240px"
          @change="handleSelectSnapshot"
        >
          <el-option
            v-for="dict in shapShotOptions"
            :key="dict.id"
            :label="dict.text"
            :value="dict.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="stat" icon="el-icon-s-data" size="mini" @click="handleQuery" v-hasPermi="['fund:account:stat']">统计</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-d-arrow-left" size="mini" @click="handlePreSnapshot">上一个快照</el-button>
        <el-button type="primary" icon="el-icon-d-arrow-right" size="mini" @click="handleNextSnapshot">下一个快照</el-button>
        <el-button type="danger" icon="el-icon-delete" size="mini" @click="handleDeleteSnapshot" v-hasPermi="['fund:accountSnapshotInfo:delete']">删除当前快照</el-button>
      </el-form-item>
    </el-form>

    <!--图表数据-->
    <div>
      <common-chart :chartData="chartData"/>
    </div>

  </div>
</template>

<script>
  import {getAccountTree,getAccountStat} from "@/api/fund/account";
  import {getAccountSnapshotInfoTree,createAccountSnapshotInfo,deleteAccountSnapshotInfo} from "@/api/fund/accountSnapshotInfo";
  import Treeselect from "@riophae/vue-treeselect";
  import "@riophae/vue-treeselect/dist/vue-treeselect.css";
  import CommonChart from '../../chart/commonChart'

export default {
  name: "AccountStat",
  components: {
    'common-chart':CommonChart
  },
  mounted() {
     //this.initChart();
  },
  data() {
    return {
      //图表数据
      chartData:{},
      // 加载层信息
      loading: [],
      //加载层配置
      loadingOptions:this.loadingOptions,
      //账户列表
      typeOptions:[],
      //账户状态
      statusOptions:[],
      //账户快照
      shapShotOptions:[],
      //账户快照数据分组
      groupTypeOptions:[
        {
          id: 'NAME',
          text: '名称'
        },
        {
          id: 'TYPE',
          text: '类型'
        },
        {
          id: 'STATUS',
          text: '状态'
        }
      ],
      // 查询参数
      queryParams: {
        groupType:'NAME'
      },
      //账户快照查询参数
      shapShotQueryParams: {
        minId:undefined,
        maxId:undefined,
        page:1,
        pageSize:20,
        needRoot:false
      }
    };
  },
  created() {
    //查询类型树
    this.getEnumTree('AccountType','FIELD',false).then(response => {
      this.typeOptions = response;
    });
    //状态类型树
    this.getEnumTree('AccountStatus','FIELD',false).then(response => {
      this.statusOptions = response;
    });
    this.getSnapshotOptionsTreeselect();
    this.initChart();
  },
  methods: {
    // 打开加载层
    openLoading() {
      this.loading = this.$loading(this.loadingOptions);
    },
    /** 查询账户快照下拉树结构 */
    getSnapshotOptionsTreeselect() {
      getAccountSnapshotInfoTree(this.shapShotQueryParams).then(response => {
        this.shapShotOptions = response;
      });
    },
    /** 更新账户快照下拉树结构 */
    refreshSnapshotOptionsTreeselect(maxId,minId) {
      this.shapShotQueryParams.minId = minId;
      this.shapShotQueryParams.maxId = maxId;
      this.getSnapshotOptionsTreeselect();
      const l = this.shapShotOptions.length;
      if(l>0){
        var index=0;
        if(maxId!=null){
          index=0;
        }
        if(minId!=null){
          index = 1-1;
        }
        this.queryParams.snapshotId = this.shapShotOptions[index].id;
      }
      this.handleQuery();
    },
    /** 上一个快照操作 */
    handlePreSnapshot() {
      const minId = this.queryParams.snapshotId;
      const maxId = undefined;
      this.refreshSnapshotOptionsTreeselect(maxId,minId);
    },
    /** 下一个快照操作 */
    handleNextSnapshot() {
      const minId = undefined;
      const maxId = this.queryParams.snapshotId;
      this.refreshSnapshotOptionsTreeselect(maxId,minId);
    },
    handleDeleteSnapshot() {
      const snapshotId = this.queryParams.snapshotId;
      if(snapshotId==undefined){
        this.msgError('请先选择一个快照');
        return;
      }
      this.$confirm('是否确认删除编号为"' + snapshotId + '"的账户快照?', "警告", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }).then(function() {
          return deleteAccountSnapshotInfo(snapshotId);
        }).then(() => {
          this.getList();
          this.msgSuccess("删除成功");
        }).catch(function() {});
    },
    /** 快照选中事件 */
    handleSelectSnapshot(val) {
      this.initChart();
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.initChart();
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.resetForm("queryForm");
      this.initChart();
    },
    initChart() {
      this.openLoading();
      getAccountStat(this.queryParams).then(
        response => {
          //组装chart数据
          response.chartType='PIE';
          this.chartData = response;
          this.loading.close();
        }
      );
    }
  }
};
</script>
