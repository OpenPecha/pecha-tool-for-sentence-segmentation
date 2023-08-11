import React from "react";

function Table({ users }) {
  return (
    <div className="overflow-x-auto">
      <table className="table table-md">
        <thead>
          <tr>
            <th></th>
            <th>Name</th>
            <th>Role</th>
            <th>Approved</th>
            <th>Rejected</th>
            <th>Error</th>
            <th>Payment</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user, index) => (
            <Row key={index + "_count"} user={user} index={index} />
          ))}
        </tbody>
        <tfoot>
          <tr>
            <th></th>
            <th>Name</th>
            <th>Role</th>
            <th>Approved</th>
            <th>Rejected</th>
            <th>Error</th>
            <th>Payment</th>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

function Row({ user, index }) {
  let approved = user.approved_text.length;

  const totalErrorCount = user?.approved_text.reduce(
    (acc, obj) => acc + parseInt(obj.error_count),
    0
  );
  let errorcount = totalErrorCount / user?.approved_text?.length;

  const finalErrorCount = isNaN(errorcount) ? 0 : errorcount;
  const pay = user.approved_text.length * 100 - finalErrorCount * 10;
  return (
    <tr>
      <th>{index + 1}</th>
      <td>{user.username}</td>
      <td>{user.role}</td>
      <td>{approved}</td>
      <td>{user.rejected_list.length}</td>
      <td>{finalErrorCount.toFixed(2)} %</td>
      <td>Rs {pay.toFixed(2)}</td>
    </tr>
  );
}

export default Table;
