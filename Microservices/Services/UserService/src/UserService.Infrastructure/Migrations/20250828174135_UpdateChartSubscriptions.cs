using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace UserService.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class UpdateChartSubscriptions : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropPrimaryKey(
                name: "PK_ChartSubscriptions",
                table: "ChartSubscriptions");

            migrationBuilder.AddPrimaryKey(
                name: "PK_ChartSubscriptions",
                table: "ChartSubscriptions",
                columns: new[] { "UserId", "Symbol" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropPrimaryKey(
                name: "PK_ChartSubscriptions",
                table: "ChartSubscriptions");

            migrationBuilder.AddPrimaryKey(
                name: "PK_ChartSubscriptions",
                table: "ChartSubscriptions",
                columns: new[] { "UserId", "Symbol", "Interval" });
        }
    }
}
