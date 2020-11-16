<template>
  <div class="app-container">

    <!--列表数据-->
    <el-table
      :data="dataList"
      row-key="id">
      <el-table-column label="序号" prop="id" sortable="custom" align="center">
        <template slot-scope="{row}">
          <span>{{ row.id }}</span>
        </template>
      </el-table-column>
      <el-table-column label="名称"  :show-overflow-tooltip="true">
        <template slot-scope="{row}">
          <span>{{ row.name }}</span>
        </template>
      </el-table-column>
      <el-table-column label="得分" align="center">
        <template slot-scope="{row}">
          <span v-if="row.score==0" style="color:red">
           {{ row.score }}
          </span>
          <span v-else-if="row.score==row.maxScore" style="color:green">
           {{ row.score }}
          </span>
          <span v-else>
            {{ row.score }}
          </span>
        </template>
      </el-table-column>
      <el-table-column label="单项满分" align="center">
        <template slot-scope="{row}">
          <span>{{ row.maxScore }}</span>
        </template>
      </el-table-column>
      <el-table-column label="统计值" align="center" width="80">
        <template slot-scope="{row}">
          <span>{{ row.statValue }}</span>
        </template>
      </el-table-column>
      <el-table-column label="参考值" align="center" width="80">
        <template slot-scope="{row}">
          <span>{{ row.limitValue }}</span>
        </template>
      </el-table-column>
      <el-table-column label="备注" align="center" width="80">
        <template slot-scope="{row}">
          <span class="link-type" @click="msgAlert('说明',row.remark)">
            <i class="el-icon-info" />
          </span>
        </template>
      </el-table-column>
    </el-table>

  </div>
</template>

<script>

export default {
  name: "Detail",
  props: {
    //父层带过来的列表值
    userScoreData: {
      list:[]
    }
  },
  data() {
    return {
      dataList:[]
    };
  },
  created() {
    this.handleReceiveData(this.userScoreData);
  },
  //监听父层带过来的账户信息值
  watch:{
    userScoreData: {
      deep: true,
      handler(val) {
        this.userScoreData =val;
        this.handleReceiveData(this.userScoreData);
      }
    }
  },
  methods: {
    handleReceiveData(data){
      this.dataList=data.list;
    }
  }
};
</script>
