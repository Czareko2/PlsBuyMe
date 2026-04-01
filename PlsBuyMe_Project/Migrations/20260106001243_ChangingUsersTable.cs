using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PlsBuyMe_Project.Migrations
{
    /// <inheritdoc />
    public partial class ChangingUsersTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Address",
                table: "Users");

            migrationBuilder.RenameColumn(
                name: "LastName",
                table: "Users",
                newName: "Role");

            migrationBuilder.RenameColumn(
                name: "FirstName",
                table: "Users",
                newName: "Password");

            migrationBuilder.AddColumn<string>(
                name: "Login",
                table: "Users",
                type: "TEXT",
                maxLength: 50,
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Login",
                table: "Users");

            migrationBuilder.RenameColumn(
                name: "Role",
                table: "Users",
                newName: "LastName");

            migrationBuilder.RenameColumn(
                name: "Password",
                table: "Users",
                newName: "FirstName");

            migrationBuilder.AddColumn<string>(
                name: "Address",
                table: "Users",
                type: "TEXT",
                nullable: false,
                defaultValue: "");
        }
    }
}
